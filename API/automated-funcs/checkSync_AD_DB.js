const sql = require('mssql')
const sqlConfig = require('../configs/sql.config.js');
const ActiveDirectory = require('activedirectory')
const adConfig = require('../configs/activeDirectory.config');
const cron = require('node-cron')

//Vérifie que les utilisateurs de l'ad sont bien dans la DB

const checkSync =  {

    syncCheck : async() => {

        await sql.connect(sqlConfig)
    
        const ad = new ActiveDirectory(adConfig)
        const groupName = "users-endor"

        const groupExists = await new Promise((resolve) => {
            
            ad.findUser("chovy.jihoon@endorforge.local", function(err, group){
                if (err) {
                    console.log(err);
                    return
                } 
                if (group) {                    
                    console.log(groupName + " existe " + group);
                    return resolve(true)
                } if (!group) {
                    
                    console.log("coucou");
                    return resolve(false)
                }
                
            })
        })

        console.log(groupExists);
        

        //ad.getUsersForGroup(groupName, function(err, users) {
        //   if(err) {
        //        console.log("ERREUR get users from group ad: " + err);
        //        return
        //    }
        //    if (!users) {
        //        console.log("GROUP " + groupName + " N'A PAS ÉTÉ TROUVÉ OU AUCUN USERS N'EN FAIT PARTIE");
        //    }
        //    console.log(users);
            
        //})
    }
    

}

exports.module = checkSync