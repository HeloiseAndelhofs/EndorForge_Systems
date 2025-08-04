//Variables running server

const express = require('express')
const router = require('./ROUTES/router')
const http = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')


const app = express()
const { PORT } = process.env

const server = http.createServer(app)



app.use(cors({
    origin: 'http://localhost:127.0.0.1', 
    credentials: true, 
}));

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024,
              files: 1
     }
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api', router)


require('./automated-funcs/cron.schedule')



server.listen(PORT, () => {
    console.log(`Connection faite sur le port ${ PORT }`);
    
})