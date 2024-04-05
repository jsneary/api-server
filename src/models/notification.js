const mongoose = require('mongoose') 
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const notificationSchema = new Schema({ 

    studyGroupId: {
        type: Schema.Types.ObjectId,
        ref: 'StudyGroup'
      },
      recieverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      body: {
        type: String,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      notificationType: {
        
      }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification