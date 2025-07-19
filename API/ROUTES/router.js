//ROUTEUR PRINCIPAL

const router = require('express').Router()
const routerOutsideApp = require('./routerOutsideApp')
const routerInsideApp = require('./routerInsideApp')

router.use('/', routerOutsideApp)
router.use('/endor', routerInsideApp)

module.exports = router