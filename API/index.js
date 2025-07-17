//Variables running server

const express = require('express')
const router = require('./ROUTES/router')
const http = require('http')
const cors = require('cors')

const app = express()
const { PORT } = process.env

const server = http.createServer(app)




app.use(express.json())
app.use('/api', router)




app.listen(PORT, () => {
    console.log(`Connection faite sur le port ${ PORT }`);
    
})