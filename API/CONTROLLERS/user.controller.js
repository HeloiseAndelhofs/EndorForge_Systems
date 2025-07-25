//CONTROLLER RELATIF AUX USERS

//Dépendances controller

const authService = require('../SERVICES/auth.service')
const userService = require('../SERVICES/user.service')
const jwt = require('jsonwebtoken');
const utilityFunctions = require('../SERVICES/utilityFuncUsers.service');

const userController = {

    login: async (req, res) => {

        try {
            
            //Récupère le username et password du body 
            const { username, email, password } = req.body

            //Vérification que les données demandées sont présentes
            if (!username || !password || !email) {
                return res.status(400).json({ message : "Nom d'utilisateur, email et mot de passe requis" })
            }

            const accessToken = req.cookies.accessToken
            const refreshToken = req.cookies.refreshToken

            //Construction du DN complet à partir du username
            //const userDN = `uid=${username},ou${}`

            //Envoie les infos du req.body au service et attend sa réponse d'auth et pour trouver l'utilisateur
            const successLogin = await userService.login(username, email, password, accessToken, refreshToken)


            //Si aucun utilisateur n'est trouvé, retourne une erreur
            if (!successLogin) {
                return res.status(404).json({ messsage : `La connexion a échouée, aucun utilisateur avec le nom ${username} trouvé. ` })
            }

            if (accessToken && refreshToken) {
                return res.redirect('/endor/yourProfile')
            }

            console.log("ACCESS TOKEN CONTROLLER : " + successLogin.newAccessToken);
            console.log("REFRESH TOKEN CONTROLLER : " + successLogin.newRefreshToken);
            
            

            //renvoie du token d'accès
            res.cookie('accessToken', successLogin.newAccessToken) //FAIRE UNE MEILLEURE SECURITE AVEC LES OPTIONS

            //renvoie le token d'actualisation
            res.cookie('refreshToken', successLogin.newRefreshToken) //FAIRE UNE MEILLEURE SECURITE AUSSI

            return res.status(200).json({ message: `${username} authentifié` })

        } catch (err) {
            console.error("Erreur LDAP : " + err);
            return res.status(500).json({ message : "Erreur login LDAP" })
        }

    },

    logout: (req, res) => {

        try {
            console.log(req.cookies.token.username);
            
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken')
            return res.status(200).json({ message: 'Déconnexion réussie.' });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message : "Erreur logout" })
        }

    },

    refreshToken: async(req, res) => {

         try {

            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) return res.status(401).json({ message: "Aucun token de rafraîchissement." });

            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await userService.getUserById(decoded.id);

            if (!user) return res.status(403).json({ message: "Utilisateur introuvable." });

            const newAccessToken = authService.createAccessToken(user);
            
            res.cookie('accessToken', newAccessToken);
            return res.status(200).json({ message: "Token actualisé." });

        } catch (err) {
            return res.status(403).json({ message: "Refresh token invalide ou expiré." });
        }

    },

    getYourProfile: async(req, res) => {

        try {

            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const id = decoded.id

            console.log(token);
            

            const user = await userService.getUserById(id)

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
                res.status(200).json(usersList)
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