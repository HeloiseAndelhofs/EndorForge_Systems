//ROUTES DANS L'INTRANET

const router = require('express').Router()

const userController = require('../CONTROLLERS/user.controller')

router.get('/users', userController.getUsers)

module.exports = router