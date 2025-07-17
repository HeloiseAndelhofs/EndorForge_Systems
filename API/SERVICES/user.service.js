//Dépendances nécessaires au service

const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActiveDirectory = require('activedirectory')
const adConfig = require('../configs/activeDirectory.config');


//Connexion à l'active directory





const userService = {
    
    login : async (username, password) => { //A VERIFIER !!!!!! EST CE QUE activedirectory a besoin d'un async/await

        console.log('SALUT!!!!!')
        
        try {

            const ad = new ActiveDirectory(adConfig)

            console.log('COUCOU');



            ad.authenticate(username, password, function(err, auth){

                if (err) {
                    console.log(`ERROR : ${err}`);
                    return
                }

                if (auth) {
                    console.log(`${username} authentifié ! `);
                    return
                }
                else{
                    console.log("Échec de l'authentification");
                }

            }) // !!!! Ce sera ça qu'il faudra utiliser quand l'ad sera configurer
    

            
        } catch (error) {
            console.log(error + 'ERREUR');
            
        }
        
    }

}


module.exports = userService