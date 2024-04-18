const { IgApiClient } = require('instagram-private-api');
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const get = require('request-promise')
//const get = require('get')

//https://upcdn.io/W142hJk/raw/demo/4kgZblRC61.jpg

router.post('/user/insta-post', auth, async (req, res) => {
    console.log("posting")
    let user = req.user;
    let data = req.body;

    let result = await postToInsta(user.toJSON(), JSON.stringify(data));
    console.log(result);

    if (result === true) {
        res.status(201).send("instagram post created!");
    }
    else {
        res.status(400).send("unable to post to instagram");
    }
});

const postToInsta = async (user, data) => {
    data = JSON.parse(data);
    console.log(user.ig_username);
    console.log(user.ig_password);
    console.log(data.caption);
    console.log(data.image_url);

    try {
        console.log("made it to 34")
        const ig = new IgApiClient();
        console.log("made it to 36")
        ig.state.generateDevice(user.ig_username);
        console.log("made it to 38")
        await ig.account.login(user.ig_username, user.ig_password);
        console.log("made it to 40")
        const imageBuffer = await get({
            url: data.image_url,
            encoding: null,
        });
        console.log("made it to 45")
        await ig.publish.photo({
            file: imageBuffer,
            caption: data.caption,
        });

        return true;
    }
    catch (e) {
        console.log("unable to post to instagram :(");
        console.log(e)
        return false;
    }
};

router.patch("/user/insta", auth, async (req, res) => {
    let user = req.user;
    let body = req.body;
    console.log(user)
    console.log(body)

    if (!mongoose.isValidObjectId(user._id)) {
        res.status(400).send("Invalid request");
        return;
    }

    console.log("user is valid")

    try {
        console.log(user._id)
        let igUser = await User.findById(user._id);
        console.log(igUser);

        if (!igUser) {
            res.status(400).send("user not found");
            return;
        }

        igUser.ig_username = body.ig_username.toString();
        igUser.ig_password = body.ig_password.toString();

        console.log("ig username: " + igUser.ig_username);
        console.log("ig password: " + igUser.ig_password);

        await igUser.save();
        res.send("Instagram info updated");
    }
    catch (e) {
        res.status(400).send("unable to add instagram info");
    }
});

module.exports = router