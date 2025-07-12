//Variables running server

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port, () => {
    console.log(`Connection faite sur le port ${port}`);
    
})