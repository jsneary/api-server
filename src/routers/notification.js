const express = require('express') 
const auth = require('../middleware/auth')
const router = express.Router() 
const Notification = require('../models/notification')
const User = require('../models/user')

router.post('/notification', auth, async (req, res) => { 
    console.log("BODY:")
    console.log(req.body) 
    req.body.senderId = req.user._id
    
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

router.get('/notifications', auth, async (req, res) => { 
    console.log("BODY:")
    console.log(req.body)
    console.log(req.user._id) 
    
    try {
        const notifications = await Notification.find({ recieverId: req.user._id })

        res.status(200).send({notifications})

    }
    catch (e) {
        console.log(e)
        console.log("failed to find notification")
    }
    
})

module.exports = router