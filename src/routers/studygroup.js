const express = require('express')
const auth = require('../middleware/auth')
const mongoose = require ('mongoose')
const StudyGroup = require('../models/studygroup')


const router = express.Router()

router.post('/studygroup', auth, async (req, res) => {
    delete req.body.owner
    delete req.body.participants

    const user = req.user

    

    try {
        const group = new StudyGroup({
            ...req.body,
            owner: user._id
        })

        await group.save()
        res.status(201).send()
    }
    catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

router.patch('/studygroup/:id', auth, async (req, res) => {
    const user = req.user
    const studyGroupID = req.params.id
    const mods = req.body
    let studygroup = undefined
    if (!mongoose.isValidObjectId(studyGroupID)) {
        res.status(400).send("Invalid object id")
        return
    }
    try {
        studygroup = await StudyGroup.findById(studyGroupID)
    if (!studygroup) {
        res.status(400).send('Invalid study group id')
        return
    }
    }
    catch (e) {
        res.status(500).send('Error finding study group')
        return
    }
    // verity user is owner
    if (!studygroup.owner.equals(user._id)) {
        console.log(studygroup.owner)
        console.log(user._id)
        res.status(401).send("Server is down for maintenance")
        return
    }
    const props = Object.keys(mods)
    const modifiable = [
        "name",
        "is_public",
        "max_participants",
        "start_date",
        "end_date",
        "meeting_times",
        "description",
        "school",
        "course_number"
    ]
    // check that all the props are modifable
    const isValid = props.every((prop) => modifiable.includes(prop))
    if (!isValid) {
        res.status(400).send("One or more invalid properties")
        return
    }
    try {
    
    // set new values
    props.forEach((prop) => studygroup[prop] = mods[prop])
        await studygroup.save()
        res.send(studygroup)
    }
    catch (e) {
        console.log(e)
        res.status(500).send("Error saving study group")
    }
})

router.patch('/studygroup/:id/participants', auth, async (req, res) => {
    console.log(req.user)
    console.log("REQUEST")
   

    const user = req.user
    const studyGroupID = req.params.id
    const mods = req.body
    let studygroup = undefined
    if (!mongoose.isValidObjectId(studyGroupID)) {
        res.status(420).send("Invalid object id")
        return
    }

    console.log(req.params.id)
    console.log("User: " + user)

    try {
        studygroup = await StudyGroup.findById(studyGroupID)
        if (!studygroup) {
            res.status(400).send('Invalid study group id')
            return
        }
    }
    catch (e) {
        res.status(500).send('Error finding study group')
        return
    }
    console.log(studygroup)



    if ( req.query.hasOwnProperty('add') ){
        console.log("HAS PROPERTY ADD")
        //studygroup.participants.push(req.params.id)
    }
    console.log(req.body.participants)
    console.log("Mods: " + mods)


    const props = Object.keys(mods)
    console.log("Props: " + props)
    const modifiable = [
        "participants"
    ]

    const isValid = props.every((prop) => modifiable.includes(prop))
    if (!isValid) {
        res.status(400).send("One or more invalid properties")
        return
    }
    try {
        if (studygroup.participants.length >= studygroup.max_participants) {
            res.status(418).send();
            return
        }
        if (studygroup.is_public) {
            console.log("is public")
            console.log(studygroup.participants.length)
            if (req.query.hasOwnProperty('add') && studygroup.participants.length < studygroup.max_participants) {
                studygroup.participants.indexOf(req.body.participants) === -1 ? studygroup.participants.push(req.body.participants) : console.log("ID already in array")
            }
            else if (req.query.hasOwnProperty('remove')) {
                studygroup.participants.splice(studygroup.participants.indexOf(req.body.participants), 1)
            }
        }
        else if (req.query.hasOwnProperty('remove')) {
            studygroup.participants.splice(studygroup.participants.indexOf(req.body.participants), 1)
        }
    // set new values
        //props.forEach((prop) => studygroup[prop] = mods[prop])
        //studygroup.participants.push(req.params.id)
        
        await studygroup.save()
        res.send(studygroup)
    }
    catch (e) {
        console.log(e)
        res.status(500).send("Error saving study group")
    }
})

router.get('/studygroups', auth, async (req, res) => {
    console.log('incoming request')
    let filter = {
        $and: []
    }
    const projection = {
        name: 1,
        owner: 1,
        is_public: 1,
        max_participants: 1,
        description: 1,
        start_date: 1,
        end_date: 1,
        meeting_times: 1,
        school: 1,
        course_number: 1,
        participants: 1,
    }
    const options = {}

    /*filter.$and.push({
        $or: [
            { is_public: true },
            { owner: req.user._id }
        ]
    })*/
    if ( req.query.hasOwnProperty('mine') ){
        filter.$and.push({
            $or: [
                //{ is_public: true },
                { owner: req.user._id }
            ]
        })
    }
    else {
        filter.$and.push({
            $or: [
                { is_public: true },
                { owner: req.user._id }
            ]
        })
    }

    if ( req.query.hasOwnProperty('member') ){
        filter.$and.push({
            $or: [
                { participants: req.user._id },
                { owner: req.user._id }
            ]
        })
    }

    if (req.query.hasOwnProperty('ongoing')) {
        const now = new Date();
        if (req.query.ongoing === 'true') {
            filter.$and.push({ start_date: { $lte: now } })
            filter.$and.push({ end_date: { $gt: now } })
        }
        else {
            filter.$and.push({
                $or: [
                    { start_date: { $gt: now} },
                    { end_date: { $lt: now } }
                ]
            })
        }
    }

    if (req.query.hasOwnProperty('search')) {
        filter.$and.push({
            $text: {
                $search: req.query.search
            }
        })
    }
    console.log(JSON.stringify(filter))

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        options.sort = {}
        options.sort[parts[0]] = (parts[1] == 'asc') ? 1 : -1
    }

    if (req.query.limit) {
        options.limit = req.query.limit
    }

    if (req.query.skip) {
        options.skip = req.query.skip
    }

    /*console.log(options.owner)
    options.owner = req.user._id
    console.log(options.owner)*/
    console.log("logging working")
    try {
        const results = await StudyGroup.find(filter, projection, options)
        /*let modifiedResults = []
        if (!req.query.hasOwnProperty('member')) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].participants.includes(req.user._id) || results[i].owner.equals(req.user._id)) {
                    console.log("INCLUDED")
                    modifiedResults.push(results[i])
                }
                
                if (results[i].owner.equals(req.user._id)) {
                    modifiedResults.push(results[i])
                }
                else {
                    let length = results[i].participants.length
                    for (let j = 0; j < length; j++) {
                        console.log("Participants")
                        console.log(results[i].participants[j])
                        console.log(req.user._id)
                        if (results[i].participants[j].equals(req.user._id) || results[i].owner.equals(req.user._id)) {
                            modifiedResults.push(results[i])
                            console.log("True")
                        }
                    }
                }
            }
        }
        else {
            modifiedResults = results;
        }*/
        res.send(results)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }

})

router.delete('/studygroup/:id', auth, async (req, res) => {
    const user = req.user;
    const studyGroupID = req.params.id;
    let studyGroup = null;

    if (!mongoose.isValidObjectId(studyGroupID)) {
        res.status(400).send("Invalid request");
        return;
    }

    try {
        studyGroup = await StudyGroup.findById(studyGroupID)

        if (!studyGroup) {
            res.status(400).send("Study group not found");
            return;
        }

        if(!studyGroup.owner.equals(user._id)) {
            res.status(401).send();
            return;
        }

        await studyGroup.deleteOne();
        res.send()
    }
    catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

module.exports = router