const express = require('express') 
const auth = require('../middleware/auth')
const router = express.Router() 
const Notification = require('../models/notification')

router.post('/notification', auth, async (req, res) => { 
    console.log(req.body) 
    try {
        const notification = new Notification(req.body)
        await notification.save()
        res.status(201).send()
    }
    catch (e) {
        console.log(e)
        console.log("failed to save notification")
    }
    
}) 

module.exports = router