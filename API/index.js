//Variables running server

require('dotenv').config()
const express = require('express')
const router = require('./ROUTES/router')
const http = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')


const app = express()
const { PORT } = process.env

const server = http.createServer(app)


app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", "http://localhost:8000"],                // tout vient du domaine
                scriptSrc: ["'self'"],                 // juste mes propres JS
                styleSrc: ["'self'"],                  // juste mes CSS
                imgSrc: ["'self'", "data:"],           // images locales ou encodées
                connectSrc: ["'self'", "http://localhost:8000"], // API Express autorisée
                mediaSrc: ["'self'"],                  // vidéos/audio locaux
                objectSrc: ["'none'"],                 // sécurité
                frameSrc: ["'self'", "http://localhost:8000"],                  // iframes
            }
        }
    })
)

//tests headers
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     console.log("Headers envoyés :", res.getHeaders());
//   });
//   next();
// });


app.use(cors({
    origin: 'http://nova.endorforge.local', 
    credentials: true
}));

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024,
              files: 1
     }
}))

app.use(cookieParser())
app.use(express.json())

app.use('/api', router)


//require('./automated-funcs/cron.schedule')



server.listen(PORT, '0.0.0.0', () => {
    console.log(`Connection faite sur le port ${ PORT }`);
    
})