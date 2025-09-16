//CONTROLLER RELATIF AUX USERS

//Dépendances controller

const authService = require('../SERVICES/auth.service')
const userService = require('../SERVICES/user.service')
const refreshTokenService = require('../SERVICES/refreshToken.service')
const jwt = require('jsonwebtoken');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service');

const userController = {

    login: async (req, res) => {

        try {
            
            //Récupère le username et password du body 
            const { email, password } = req.body

            //Vérification que les données demandées sont présentes
            if (!password || !email) {
                return res.status(400).json({ message : "Nom d'utilisateur, email et mot de passe requis" })
            }

            console.log("ON ME VOIT 1 ?????");
            

            //Envoie les infos du req.body au service et attend sa réponse d'auth et pour trouver l'utilisateur
            const successLogin = await userService.login(email, password, accessToken)
            console.log("EST CE QU'ON ME VOIT 2 !!!!????");
            

            //Si aucun utilisateur n'est trouvé, retourne une erreur
            if (!successLogin) {
                return res.status(404).json({ messsage : `La connexion a échouée, aucun utilisateur avec le mail ${email} trouvé. ` })
            }

            console.log("ACCESS TOKEN CONTROLLER : " + successLogin.newAccessToken);
            
            //await refreshTokenService.save(successLogin.id, newRefreshToken)
            
            return res.status(200).json({ 
                accessToken : successLogin.newAccessToken,
                message: `${email} authentifié` 
            })

        } catch (err) {            
            console.error("Erreur LDAP DANS LE USER CONTROLLER LOGIN : " + err);
            return res.status(500).json({ message : "Erreur login LDAP" })
        }

    },

    logout: async (req, res) => {

        try {
            const authHeader = req.headers['authorization']
            const accessToken = authHeader && authHeader.split(' ')[1]
            await refreshTokenService.revoke(accessToken)
            return res.status(200).json({ message: 'Déconnexion réussie.' });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message : "Erreur logout" })
        }

    },

    getYourProfile: async(req, res) => {

        try {
            console.log("CONTROLLER");
            
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.email

            console.log(token);
            
            const user = await utilityFunctions.getUser(email)

            if (!user) {
                return res.status(404).json({ message : "Nous n'avons pas pu trouver votre profil utilisateur." })
            }

            return res.status(200).json(user)

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message : "Erreur serveur lors de la récupération du profil utilisateur." })
        }

    },


    getUsers: async(req, res) => {
        try {
            
            console.log("Controller getUsers Hello");
            
            const usersList = await userService.getUsers()

            if (usersList) {
               return res.status(200).json(usersList)
            } else {
                return res.status(404).json({ message: 'Impossible de récupérer les utilisateurs' })
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des utilisateurs' })
        }
    },

    getUserByName: async(req, res) => {

        try {
            
            const { username } = req.query
            console.log(username);
            
            if (!username) {
                return res.status(400).json({ message : "Aucun utilisateur recherché." })
            }

            const result = await userService.getUserByName(username)

            if (!result) {
                return res.status(404).json({ message : `Aucun utilisateur avec le nom ${username} n'a été trouvé.` })
            }

            return res.status(200).json(result)

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message : "Une erreur est survenue lors de la récupération des utilisateurs" })
        }

    }

}

module.exports = userController