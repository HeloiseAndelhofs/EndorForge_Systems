//ROUTES DANS L'INTRANET

const router = require('express').Router()

const auth = require('../MIDDLEWARES/auth.middleware')
const userController = require('../CONTROLLERS/user.controller')
const filesController = require('../CONTROLLERS/files.controller')

router.get('/users', auth, userController.getUsers)
router.get('/yourProfile', auth, userController.getYourProfile)
router.get('/searchUser', auth, userController.getUserByName)
router.get('/logout', userController.logout)

router.post('/postFile', auth, filesController.uploadFile)



module.exports = router
