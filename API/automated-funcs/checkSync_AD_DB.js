const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service.js');


let datasLog = []


//Vérifie que les utilisateurs de l'ad sont bien dans la DB

const ad_db_func =  {
  
  syncCheck : async() => {
    
    await sql.connect(sqlConfig)
    const ad = await new Client({url: adConfig.url, tlsOptions : adConfig.tlsOptions})

    try {
        console.log(ad);
        
        await ad.bind(adConfig.bindDN, adConfig.bindCredentials)
      
        const usersDB = await new sql.Request()
                .query(`SELECT u.*, t.*
                        FROM users u 
                        JOIN teams t ON u.FK_team_id = t.team_id`)


        //VERIFIER SI ON PEUT PAS SIMPLIFIER
        // Requête 1 : récupérer tous les utilisateurs
        const { searchEntries: userEntries } = await ad.search(adConfig.baseDN, {
          scope: 'sub',
          filter: '(objectClass=person)', // ou 'user' si AD classique
          attributes: ['uid', 'cn', 'mail'],
        });

        // Requête 2 : récupérer tous les groupes avec leurs membres
        const { searchEntries: groupEntries } = await ad.search(adConfig.baseDN, {
          scope: 'sub',
          filter: '(objectClass=groupOfNames)',
          attributes: ['cn', 'member'],
        });


        //FONCTIONS POUR RÉCUPÉRER LES GROUPES D'UN USER
        // Map : user DN => liste de groupes
        const userGroupsMap = {};

        for (const group of groupEntries) {
          const groupName = group.cn;
          const members = Array.isArray(group.member) ? group.member : [group.member];

          for (const memberDN of members) {
            if (!userGroupsMap[memberDN]) {
              userGroupsMap[memberDN] = [];
            }
            userGroupsMap[memberDN].push(groupName);
          }
        }


        //RÉCUPERER LES TYPES DE CONTRAT
        function getContractType(groups) {
          if(!groups) return false
          if(groups.includes('COOKIES')) return 'COOKIES' 
          if(groups.includes('CDI')) return 'CDI'
          if(groups.includes('CDD')) return 'CDD'
        }

        //RÉCUPERE LES ROLES
        function getUserRole(groups) {
          if(!groups) return false
          if(groups.includes('RABADON')) return 'RABADON'
          if(groups.includes('TRINITE')) return 'TRINITE'
          if(groups.includes('MERCURE')) return 'MERCURE'
          if(groups.includes('COOKIES')) return 'COOKIES'
          if(groups.includes('PINKWARD')) return 'PINKWARD'
        }


       for (const userDB of usersDB.recordset) {
        const matchInAD = userEntries.find(userAD => userAD.mail === userDB.user_email)

        if (!matchInAD) {
          console.warn(`L'utilisateur avec le mail ${userDB.user_email} est dans la base de donnée mais pas dans l'ad`);
          return
        }
        console.log(`FOR USERS DB : L'utilisateur avec le mail ${userDB.user_email} se trouve bien dans l'ad et la db`);
       }


       for (const userAD of userEntries) {
          const matchInDB = usersDB.recordset.find(userDB => userDB.user_email === userAD.mail)

          if (!matchInDB) {
            console.warn(`L'utilisateur avec le mail ${userAD.mail} est dans l'AD mais pas dans la DB`);

            const cnSplit = userAD.cn.split(" ")
            const name = cnSplit[0]

            const firstname = cnSplit[1]

            const loginName = userAD.uid
            const mail = userAD.mail

            const groups = userGroupsMap[userAD.dn]

            const contractType = getContractType(groups); // stage / CDD / CDI
            const role = getUserRole(groups); // admin / user / etc.


            const match = userAD.dn.match(/ou=([^,]+)/i);
            const ou = match ? match[1] : null;
            const teamID = await utilityFunctions.getTeamId(ou)
            console.log(loginName, mail);
            console.log(userAD);
            console.log(role);
            
            
            

            const isActive = true
            const birthday = '1985-04-17' //A CHANGER

            const req = new sql.Request()
            const addUser = await req
                  .input('name', sql.VarChar(100), name)
                  .input('firstname', sql.VarChar(100), firstname)
                  .input('loginName', sql.VarChar(100), loginName)
                  .input('email', sql.VarChar(255), mail)
                  .input('birthday', sql.Date, birthday)
                  .input('role', sql.VarChar(50), role)
                  .input('isActive', sql.Bit, isActive)
                  .input('createdAt', sql.DateTime, new Date())
                  .input('updatedAt', sql.DateTime, new Date())
                  .input('contract', sql.VarChar(50), contractType)
                  .input('teamID', sql.Int, teamID)
                  
                  .query(`
                    INSERT INTO USERS (
                    user_name, user_firstname, user_login_name, user_email, user_birthdate, user_role,
                    user_isActive, user_createdAt, user_updatedAt, user_contract_type, FK_team_id
                    )
                    VALUES (@name, @firstname, @loginName, @email, @birthday, @role,
                    @isActive, @createdAt, @updatedAt, @contract, @teamID)
                    `)
                    
            datasLog.push(`${userAD.uid} n'a pas été trouvé dans la DB, son profil vient d'être créé.`, userAD, addUser)
          }

        console.log(`FOR USERS AD : L'utilisateur avec le mail ${userAD.mail} se trouve bien dans l'ad et la db`);
       }
        
      } catch (err) {
        datasLog.push(`Une erreure s'est produite lors de la synchronisation AD - DB, ${err}`)
        console.error(err);
        throw new Error(err)
      } finally {
        await ad.unbind()
        return datasLog
      }
    }
    

}

module.exports = ad_db_func