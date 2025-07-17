const router = require('express').Router()

//test
const userService = require('../SERVICES/user.service')

router.get('/', () => {
    console.log("Salut salut c'est un test");
    
})

router.post('/login', async (req, res) => {

    console.log("Coucou c'est la route login");
    

    const { username, password } = req.body

    try {
        
        const successLogin = await userService.login(username, password)

        if (successLogin) {
            return res.status(200).json({message : 'Authentification réussie'})
        } else {
            return res.status(401).json({message : 'Authentification échouée'})
        }

    } catch (err) {
        console.error('Erreur LDAP : ' + err);
        return res.status(500).json({message : 'Erreur login LDAP'})
    }

})

module.exports = router