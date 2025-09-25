//ROUTES DANS L'INTRANET

const router = require('express').Router()

const auth = require('../MIDDLEWARES/auth.middleware')
const authorize = require('../MIDDLEWARES/authorize.middleware')

const userController = require('../CONTROLLERS/user.controller')
const filesController = require('../CONTROLLERS/files.controller')
const adminController = require('../CONTROLLERS/admin.controller')

//routes users
router.get('/users', auth, userController.getUsers)
router.get('/yourProfile', auth, userController.getYourProfile)
router.get('/searchUser', auth, userController.getUserByName)
router.get('/logout', userController.logout)

//routes teams
router.get('/teams', auth, userController.getTeams)

//routes fichiers
router.post('/files/postFile', auth, filesController.uploadFile)
router.get('/files', auth, filesController.getFiles)
router.get('/files/download/:id', auth, filesController.downloadFiles)
router.get('/files/latest', auth, filesController.getLatestFiles)

//routes Admin

//users
router.get("/admin/users", authorize('Admin'), auth, adminController.getAllUsers )

//teams
router.get('/admin/teams', authorize('Admin'), auth, adminController.getAllTeams)

//ad_db
router.get('/admin/logs', authorize('Admin'), auth, adminController.getLogs)
router.post('/admin/sync', authorize('Admin'), auth, adminController.triggerSync)

module.exports = router
