const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const cron = require('node-cron')

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

        const { searchEntries } = await ad.search(adConfig.baseDN, {
            scope: 'sub',
            filter: '(objectClass=person)', // ou 'user' selon ton schéma
            attributes: ['uid', 'cn', 'mail'],
        });

        console.log(usersDB.recordset, searchEntries);
        

       for (const userDB of usersDB.recordset) {
        const matchInAD = searchEntries.find(userAD => userAD.mail === userDB.user_email)

        if (!matchInAD) {
          console.warn(`L'utilisateur avec le mail ${userDB.user_email} est dans la base de donnée mais pas dans l'ad`);
          return
        }
        console.log(`FOR USERS DB : L'utilisateur avec le mail ${userDB.user_email} se trouve bien dans l'ad et la db`);
       }

       for (const userAD of searchEntries) {
          const matchInDB = usersDB.recordset.find(userDB => userDB.user_email === userAD.mail)

          if (!matchInDB) {
            console.warn(`L'utilisateur avec le mail ${userAD.mail} est dans l'AD mais pas dans la DB`);
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