const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const auth = require('../middlewares/auth');
const _ = require('lodash');
const bcrypt = require('bcrypt');
require('express-async-errors');

router.post('/', async (req, res)=>{
    // validate user
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // looking if email existed before
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // create user
    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // send responce to user
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.get('/me', auth, async (req, res)=>{

    // find the user
    const user = await User.findOne({
        _id: req.user._id
    });
    if(!user) return res.status(400).send('The user deleted or deactived.');

    res.send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;