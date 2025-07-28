const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const cron = require('node-cron');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service.js');

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

            const role = userGroupsMap[userAD.dn];//IL VA SUREMENT RESSORTIR LE CONTRAT AUSSI

            const match = userAD.dn.match(/ou=([^,]+)/i);
            const ou = match ? match[1] : null;
            const teamID = await utilityFunctions.getTeamId(ou)

            const req = new sql.Request()
            const addUser = await req
                  .input('name', sql.VarChar(100), name)
                  .input('firstname', sql.VarChar(100), firstname)
                  .input('loginName', sql.VarChar(100), userAD.uid)
                  .input('email', sql.VarChar(255), userAD.mail)
                  .input('role', sql.VarChar(50), role)
                  .input()
                  

            return
          }
        console.log(`FOR USERS AD : L'utilisateur avec le mail ${userAD.mail} se trouve bien dans l'ad et la db`);
       }
        
        
        
      } catch (err) {
        console.error(err);
        throw new Error(err)
      } finally {
        await ad.unbind()
      }
    }
    

}

module.exports = ad_db_func