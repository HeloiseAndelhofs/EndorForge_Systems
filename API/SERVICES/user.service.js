//SERVICE RELATIF AUX USERS

//Dépendances nécessaires au service

const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const { Client } = require('ldapts')
const adConfig = require('../configs/activeDirectory.config');
const jwt = require('jsonwebtoken')

const utilityFunctions = require('./utilityFuncUsers.service.js');
const authService = require('./auth.service.js');

let ad;

const userService = {
    
    login: async (email, password, accessToken, refreshToken) => {
        
        console.log('SALUT!!!!!');
        try {
            //Connexion à l'active directory
            ad = new Client({url : adConfig.url, tlsOptions : adConfig.tlsOptions});
            
            await ad.bind(adConfig.bindDN, adConfig.bindCredentials)

            // Rechercher l'utilisateur (récupérer son DN)
            const { searchEntries } = await ad.search(adConfig.baseDN, {
                scope: 'sub',
                filter: `(mail=${email})`,
                attributes: ['dn', 'cn'],
            });
            
            console.log(searchEntries[0].dn);
            

            if (searchEntries.length === 0) {
                throw new Error("Utilisateur introuvable");
            }

            const userDN = searchEntries[0].dn;

            if (!userDN) {
                return false
            }    

            // 3. Rebind avec les identifiants utilisateur
            await ad.bind(userDN, password);

            //On appelle un service pour récupérer les infos utilisateurs
            const user = await utilityFunctions.getUser(email)
                

            if (!user) {
                throw new Error(`Aucun utilisateur avec l'email ${email} n'a été trouvé dans la base de données`)
            }
                            
            const newAccessToken = await authService.createAccessToken(user)
            const newRefreshToken = await authService.createRefreshToken(user)
            

            console.log('TOKEN USER SERVICE ' + newAccessToken);
            console.log('TOKEN REFRESH USER SERVICE ' + newRefreshToken);

            return { user, newAccessToken, newRefreshToken }

        } catch (err) {

            console.log(err + ' User service, login ERREUR');
            throw new Error(err.message);
            
        } finally {

            if (ad) {
            try {
                await ad.unbind();
            } catch (unbindErr) {
                console.warn("Erreur pendant le unbind LDAP :", unbindErr.message);
            }
        }}
    },

        getUsers: async() => {

            try {
                    
            console.log("Service getUsers Hello");
            

                await sql.connect(sqlConfig)
                const request = new sql.Request()

                const result = await request
                    .query(`SELECT * FROM users`)
                

                return result.recordset

            } catch (err) {
                console.error(err);
                throw new Error(err.message)
            }
        },

        getUserById : async(id) => {

            try {

                await sql.connect(sqlConfig)
                const request = new sql.Request()

                const result = await request
                        .input('id', sql.Int, id)
                        .query(`SELECT * FROM users WHERE user_id = @id`)


                if (result.recordset.length <= 0) {
                    throw new Error(`L'utilisateur n'a pas été trouvé dans la base de données`);
                }

                return result.recordset[0]

            } catch (err) {
                console.error(err);
                throw new Error(err.message)
            }

        },

        getUserByName : async(username) => {

            try {

                await sql.connect(sqlConfig)
                const request = new sql.Request()

                const result = await request
                        .input('username', sql.VarChar, username)
                        .query(`SELECT * FROM users 
                                WHERE user_name = @username`)

                if (result.recordset.length <= 0) {
                    throw new Error("Erreur lors de la récupération des utilisateurs");   
                }
                
                return result.recordset

            } catch (err) {
                console.error(err + " : ERREUR USER SERVICE GET USER BY NAME");
                throw new Error(err.message);
            }

        }

}


module.exports = userService