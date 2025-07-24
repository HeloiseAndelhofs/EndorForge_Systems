//ROUTES DANS L'INTRANET

const router = require('express').Router()

const jwtVerif = require('../MIDDLEWARES/jwt_verification')
const userController = require('../CONTROLLERS/user.controller')

router.get('/users', jwtVerif, userController.getUsers)
router.get('/logout', userController.logout)
router.get('/yourProfile', jwtVerif, userController.getYourProfile)
router.get('/searchUser', jwtVerif, userController.getUserByName)

module.exports = router