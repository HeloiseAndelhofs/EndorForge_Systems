//SERVICE RELATIF AUX USERS

//Dépendances nécessaires au service

const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActiveDirectory = require('activedirectory')
const adConfig = require('../configs/activeDirectory.config');



const userService = {
    
    login: async (username, password) => {
        
        console.log('SALUT!!!!!');
        
        //Connexion à l'active directory
        const ad = new ActiveDirectory(adConfig);

        try {

            //Demande d'authentification de l'utilisateur au LDAP au travers d'une promesse
            const auth = await new Promise((resolve, reject) => {

            ad.authenticate(username, password, function(err, auth) {

                //Si erreur rejette la demande
                if (err) {
                console.log(`ERROR : ${err}`);
                return reject(err);
                }

                //Si authentification ok, résous la promesse en retournant true pour continuer la procédure
                if (auth) {
                console.log(`${username} authentifié !`);
                return resolve(true);

                //Si authentification n'est pas ok => échec de l'auth et stop de la procédure
                } else {
                console.log("Échec de l'authentification");
                return resolve(false);
                }

            });

            });

            return auth;

        } catch (error) {

            console.log(error + ' ERREUR');
            throw new Error(err.message);
            
        }
        
        },

        getUsers: async() => {

            try {
                    
            console.log("Service getUsers Hello");
            console.log(sqlConfig);
            

                await sql.connect(sqlConfig)
                const request = new sql.Request()

                const result = await request
                    .query(`SELECT * FROM users`)

                return result.recordset[0]

            } catch (err) {
                console.error(err);
                throw new Error(err.message)
            }
        }

}


module.exports = userService