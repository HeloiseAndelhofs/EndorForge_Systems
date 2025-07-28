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
        
        
        
      } catch (err) {
        console.error(err);
        throw new Error(err)
      } finally {
        await ad.unbind()
      }
    }
    

}

module.exports = ad_db_func