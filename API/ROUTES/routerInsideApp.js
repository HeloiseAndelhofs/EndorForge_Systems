//ROUTES DANS L'INTRANET

const router = require('express').Router()

const userController = require('../CONTROLLERS/user.controller')

router.get('/users', userController.getUsers)
router.get('/logout', userController.logout)
router.get('/yourProfile', userController.getYourProfile)

module.exports = router