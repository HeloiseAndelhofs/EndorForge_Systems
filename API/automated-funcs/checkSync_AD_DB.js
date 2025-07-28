const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const cron = require('node-cron')

//Vérifie que les utilisateurs de l'ad sont bien dans la DB

const ad_db_func =  {
  
  syncCheck : async() => {
    
    try {
        await sql.connect(sqlConfig)
      
        const ad = new Client({url: adConfig.url, tlsOptions : adConfig.tlsOptions})
        console.log(ad);
        
        await ad.bind(adConfig.bindDN, adConfig.bindCredentials)
      
        
        //Vérifier si un groupe existe
        const groupCN = 'users-endor'; // à adapter selon ton nom réel

        const { searchEntries: groupEntries } = await ad.search(adConfig.baseDN, {
          scope: 'sub',
          filter: `(cn=${groupCN})`,
          attributes: ['dn', 'cn'],
        });

        if (groupEntries.length === 0) {
          console.log(`Groupe "${groupCN}" introuvable`);
        } else {
          console.log(`Groupe "${groupCN}" trouvé :`, groupEntries[0].dn);
        }
        
        
      } catch (err) {
        console.error(err);
        throw new Error(err)
      }
    }
    

}

module.exports = ad_db_func