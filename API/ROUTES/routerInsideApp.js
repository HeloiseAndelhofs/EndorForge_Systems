//ROUTES DANS L'INTRANET

const router = require('express').Router()

const auth = require('../MIDDLEWARES/auth.middleware')
const userController = require('../CONTROLLERS/user.controller')

router.get('/users', auth, userController.getUsers)
router.get('/logout', userController.logout)
router.get('/yourProfile', auth, userController.getYourProfile)
router.get('/searchUser', auth, userController.getUserByName)

const ad_db_func = require('../automated-funcs/checkSync_AD_DB')
router.get('/testSync', ad_db_func.syncCheck)

module.exports = router
