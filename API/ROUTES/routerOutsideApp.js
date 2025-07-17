//ROUTES EN DEHORS DE L'INTRANET

const router = require('express').Router()

const userController = require('../CONTROLLERS/user.controller')



router.get('/', () => {
    console.log("Salut salut c'est un test");
    
})

router.post('/login', userController.login)

module.exports = router