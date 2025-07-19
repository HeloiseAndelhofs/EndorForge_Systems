//CONTROLLER RELATIF AUX USERS

//Dépendances controller

const userService = require('../SERVICES/user.service')
const sql = require('mssql')
const sqlConfig = require('../configs/sql.config')
const jwt = require('jsonwebtoken')

const userController = {

    login: async (req, res) => {

        try {
            
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

            //Si le service renvoie true => auth réussi + utilisateur existant donc affichage des données
            if (successLogin) {
                console.log(successLogin);
                return res.status(200).json({ message : "Authentification réussie !" })
            } else {
                //Si non renvoie un code d'erreur
                return res.status(401).json({ message : "Authentification échouée" })
            }

        } catch (err) {
            console.error("Erreur LDAP : " + err);
            return res.status(500).json({ message : "Erreur login LDAP" })
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