const express = require('express')
const User = require('../models/user')
const { sendVerificationEmail } = require('../emails/account.js')
const auth = require('../middleware/auth') 

const router = new express.Router()

// Add a new user
router.post('/user', async (req, res) => {
  delete req.body.email_verified
  delete req.body.tokens
  
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()

    sendVerificationEmail(user.email, user.username, token)
    res.status(201).send(user)
  }
  catch(error) {
    res.status(400).send(error)
  }
})

// Login existing user
router.post('/user/login', async (req, res) => {
  try {
      console.log(req.body.email)
      console.log(req.body.password)

      const user = await User.findByCredentials(req.body.email, req.body.password)
      console.log(user)

      if (user.email_verified === true) {
          const token = await user.generateAuthToken()
          res.status(200).send({ user, token })
      }
      else  { 
          res.status(401).send("Email has not been verified.") 
      }
  }
  catch(e) {
      console.log(e)
      res.status(500).send()
  }
})

// Logout user
router.patch('/user/logout', auth, async (req, res) => {
  const user = req.user

  try {
      user.tokens = user.tokens.filter((token) => {
          return token !== req.token
      })
      await user.save()

      res.send()
  }
  catch (e) {
      res.status(500).send()
  }
})

router.get('/user/verification', auth, async (req, res) => {
  const user = req.user
  const token = req.token

  console.log(req)

  console.log(user)
  console.log(token)

  user.email_verified = true
  user.save()
  
  res.send()
})

router.get('/user/:id', auth, async (req, res) => {
  console.log(req.user)
  console.log(req.body.username)
  console.log(req.params.id)
  try {
    const user = await User.findById(req.params.id)
    console.log("user:")
    console.log(user)
    res.status(200).send({user})
  }
  catch(e){
    console.log("Unable to find user")
  }

  
  
})

module.exports = router