require('dotenv').config({ debug: true });

/*const express = require('express')
const app = express()

// Set port to the PORT environment variable (if it is defined), 
// otherwise set it to 3000
const port = process.env.PORT || 3000

// Set up a default route ('') and return 'Hello World!' in the 
// response when requests are received
app.get('', (req, res) => {
    res.send('Hello World! My name is Justus. This is my text')
})

// Configure the server to listen for connections on the port. 
// Print to the console when ready for connections
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})*/

// default app.js ^


const express = require('express')
require('./db/mongoose')
const cors = require('cors'); 
const userRouter = require('./routers/user') 
const studygroupRouter = require('./routers/studygroup') 
const notificationRouter = require('./routers/notification') 
const instaRouter = require('./routers/insta')

const app = express() 

app.use(cors()) 
app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 

app.use(express.json()) 
app.use(userRouter) 
app.use(studygroupRouter)
app.use(notificationRouter)
app.use(instaRouter)

const port = process.env.PORT || 3000 
app.listen(port, () => { 
    console.log('Server is up on port ' + port) 
})