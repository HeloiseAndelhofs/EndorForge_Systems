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
            const { username, password } = req.body

            //Vérification que les données demandées sont présentes
            if (!username || !password) {
                return res.status(400).json({ message : "Nom d'utilisateur et mot de passe requis" })
            }

            //Construction du DN complet à partir du username
            //const userDN = `uid=${username},ou${}`

            const successLogin = await userService.login(username, password)

            if (successLogin) {
                return res.status(200).json({ message : "Authentification réussie !" })
            } else {
                return res.status(401).json({ message : "Authentification échouée" })
            }

        } catch (err) {
            console.error("Erreur LDAP : " + err);
            return res.status(500).json({ message : "Erreur login LDAP" })
        }

    }

}

module.exports = userController