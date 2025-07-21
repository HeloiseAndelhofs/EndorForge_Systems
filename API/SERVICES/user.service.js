//SERVICE RELATIF AUX USERS

//Dépendances nécessaires au service

const sql = require('mssql');
const sqlConfig = require('../configs/sql.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ActiveDirectory = require('activedirectory')
const adConfig = require('../configs/activeDirectory.config');

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

            //Connection à la db et création d'une requete
            await sql.connect(sqlConfig)
            const req = new sql.Request()

            //Vérifie l'existence de l'utilisateur avec son email
            const result = await req
                .input('email', sql.NVarChar, email)
                .query(`SELECT * FROM users 
                        WHERE user_email = @email `)

            //Si le résultat est plus petit ou égal à 0 => aucun utilisateur trouvé donc retourne faux
            if(result.recordset.length <= 0) {
                console.warn(`L'utilisateur avec l'email : ${email}, n'a pas été retrouvé dans la base de donnée`);
                return false
            } 

            //Stocke le user
            const user =  result.recordset[0];

            //A FAIRE : JONCTION TEAM - USER POUR RECUPERER LE NOM DE LA TEAM ET PAS SON ID => POUR LE USER_TEAM ET LE OU

            //Création d'un token
            const token = jwt.sign({   
                    id: user.user_id,
                    role: user.user_role,
                    team: user.user_team,
                    email: user.user_email,
                    username: `uid=${username},ou=${team},dc=endor-forge,dc=local` 
                },  JWT_SECRET, {expiresIn: '1d'})

            return { user, token }

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