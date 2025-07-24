//ROUTES DANS L'INTRANET

const router = require('express').Router()

const auth = require('../MIDDLEWARES/auth.middleware')
const jwtVerif = require('../MIDDLEWARES/jwt_verification')
const userController = require('../CONTROLLERS/user.controller')

router.get('/users', auth, userController.getUsers)
router.get('/logout', userController.logout)
router.get('/yourProfile', auth, userController.getYourProfile)
router.get('/searchUser', auth, userController.getUserByName)

module.exports = router