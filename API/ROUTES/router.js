const router = require('express').Router()
const routerOutsideApp = require('./routerOutsideApp')




router.use('/', routerOutsideApp)

module.exports = router