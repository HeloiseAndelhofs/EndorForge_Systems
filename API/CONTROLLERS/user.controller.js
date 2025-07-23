//CONTROLLER RELATIF AUX USERS

//Dépendances controller

const userService = require('../SERVICES/user.service')
const jwt = require('jsonwebtoken')

const userController = {

    login: async (req, res) => {

        try {
            
            //Vérification avec le token
            const token = req.cookies.token
            

            //Si un token existe
            if (token) {

                try {
                    
                    console.log(token + ' : TOKEN');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                                    
                    console.log(decoded.id);
                                    
                    const user = await userService.getUserById(decoded.id)
                    console.log(user);
                                    
                    
                    return res.status(200).json(user)
                    
                } catch (err) {
                    //MANIÈRE PROVISOIRE DE GÉRER LE RENOUVELLEMENT DE TOKEN ! VA FALLOIR CRÉER REFRESH TOKEN PLUS TARD !!
                    if (err === "TokenExpired") {
                        res.clearCookie('token');
                        return res.status(200).json({ message: 'Session expirée, veuillez vous reconnecter.' });
                    } else {
                        console.error(err);
                        return res.status(500).json({ message : "Erreur récupération du token." })
                    }
                }
            }


            //Récupère le username et password du body 
            const { username, email, password } = req.body

            //Vérification que les données demandées sont présentes
            if (!username || !password || !email) {
                return res.status(400).json({ message : "Nom d'utilisateur, email et mot de passe requis" })
            }



            //Construction du DN complet à partir du username
            //const userDN = `uid=${username},ou${}`

            //Envoie les infos du req.body au service et attend sa réponse d'auth et pour trouver l'utilisateur
            const successLogin = await userService.login(username, email, password)


            //Si aucun utilisateur n'est trouvé, retourne une erreur
            if (!successLogin) {
                return res.status(404).json({ messsage : `La connexion a échouée, aucun utilisateur avec le nom ${username} trouvé. ` })
            }

            res.cookie('token', successLogin.token)
            res.status(200).json({ message: `${username} authentifié` })

        } catch (err) {
            console.error("Erreur LDAP : " + err);
            return res.status(500).json({ message : "Erreur login LDAP" })
        }

    },

    logout: (req, res) => {

        try {
            console.log(req.cookies.token.username);
            
            res.clearCookie('token');
            return res.status(200).json({ message: 'Déconnexion réussie.' });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message : "Erreur logout" })
        }

    },

    getYourProfile: async(req, res) => {

        try {

            const token = req.cookies.token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const id = decoded.id

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
    }

}

module.exports = userController