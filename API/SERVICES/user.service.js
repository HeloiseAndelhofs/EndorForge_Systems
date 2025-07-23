//SERVICE RELATIF AUX USERS

//Dépendances nécessaires au service

const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActiveDirectory = require('activedirectory')
const adConfig = require('../configs/activeDirectory.config');

const utilityFunctions = require('./utilityFuncUsers.service.js')
const { JWT_SECRET } = process.env


const userService = {
    
    login: async (username, email, password) => {
        
        console.log('SALUT!!!!!');
        try {
            //Connexion à l'active directory
            const ad = new ActiveDirectory(adConfig);
            
            //Demande d'authentification de l'utilisateur au LDAP au travers d'une promesse
            const auth = await new Promise((resolve) => {

                ad.authenticate(username, password, function(err, auth) {


                    //Si authentification ok, résous la promesse en retournant true pour continuer la procédure
                    if (auth) {
                    console.log(`${username} authentifié !`);
                    return resolve(true);

                    //Si authentification n'est pas ok => échec de l'auth
                    } else {
                    console.log("Échec de l'authentification, login ou mot de passe incorrect");
                    return resolve(false);
                    }
                });

            });

            //si l'authentification échoue, renvoie false au controller qui affichera un message approprié
            if (!auth) return false

            //On appelle un service pour récupérer les infos utilisateurs
            const user = await utilityFunctions.getUser(email)
            console.log('USER de service user : ' + user);
            

            if (!user) {
                throw new Error(`Aucun utilisateur avec l'email ${email} n'a été trouvé dans la base de données`)
            }

            //A FAIRE : JONCTION TEAM - USER POUR RECUPERER LE NOM DE LA TEAM ET PAS SON ID => POUR LE USER_TEAM ET LE OU

            console.log(JWT_SECRET);
            

            //Création d'un token
            const token = jwt.sign({   
                    id: user.id_USERS,
                    role: user.user_role,
                    team: user.user_team,
                    email: user.user_email,
                    username: `uid=${username},ou=${user.team_name},dc=endor-forge,dc=local` 
                },  JWT_SECRET, {expiresIn: '1d'})

            return { user, token }

        } catch (err) {

            console.log(err + ' User service, login ERREUR');
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
        },

        getUserById : async(id) => {

            try {

                await sql.connect(sqlConfig)
                const request = new sql.Request()

                const result = await request
                        .input('id', sql.Int, id)
                        .query(`SELECT * FROM users WHERE id_USERS = @id`)


                if (result.recordset.length <= 0) {
                    throw new Error(`L'utilisateur n'a pas été trouvé dans la base de données`);
                }

                return result.recordset[0]

            } catch (err) {
                console.error(err);
                throw new Error(err.message)
            }

        }

}


module.exports = userService