//ROUTES DANS L'INTRANET

const router = require('express').Router()

const auth = require('../MIDDLEWARES/auth.middleware')
const userController = require('../CONTROLLERS/user.controller')
const filesController = require('../CONTROLLERS/files.controller')
const authorize = require('../MIDDLEWARES/authorize.middleware')

router.get('/users', auth, userController.getUsers)
router.get('/yourProfile', auth, userController.getYourProfile)
router.get('/searchUser', auth, userController.getUserByName)
router.get('/logout', userController.logout)

router.get('/teams', auth, userController.getTeams)

//CHANGER LES ROUTES POUR QU'ELLES SOIENT PLUS DISTINCTES 
// api/endor/user
// api/endor/files

router.post('/files/postFile', auth, filesController.uploadFile)
router.get('/files', auth, filesController.getFiles)
router.get('/files/download/:id', auth, filesController.downloadFiles)



module.exports = router
