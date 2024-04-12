const express = require('express') 
const auth = require('../middleware/auth')
const router = express.Router() 
const Notification = require('../models/notification')
const User = require('../models/user')

router.post('/notification', auth, async (req, res) => { 
    console.log(req.body) 
    
    //user.Notification.push()
    try {
        const notification = new Notification(req.body)
        console.log(notification)


        const userID = req.body.recieverId
        reciever = await User.findById(userID)
        console.log(reciever)
        reciever.notification.push(notification._id)

        console.log(reciever)

        await reciever.save()
        await notification.save()
        res.status(201).send()
    }
    catch (e) {
        console.log(e)
        console.log("failed to save notification")
    }
    
}) 

module.exports = router