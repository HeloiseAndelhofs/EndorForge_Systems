//ROUTES DANS L'INTRANET

const router = require('express').Router()

const userController = require('../CONTROLLERS/user.controller')

router.get('/users', userController.getUsers)
router.get('/logout', userController.logout)

module.exports = router