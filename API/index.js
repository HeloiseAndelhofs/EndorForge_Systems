//Variables running server

const express = require('express')
const router = require('./ROUTES/router')
const http = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()
const { PORT } = process.env

const server = http.createServer(app)



app.use(cors({
    origin: 'http://localhost:127.0.0.1', 
    credentials: true, 
}));

app.use(cookieParser())
app.use(express.json())
app.use('/api', router)




server.listen(PORT, () => {
    console.log(`Connection faite sur le port ${ PORT }`);
    
})