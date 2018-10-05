const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const auth = require('../middlewares/auth');
const _ = require('lodash');
require('express-async-errors');

router.post('/', async (req, res)=>{
    // validate user
    const { error } = validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message });

    // looking if email existed before
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ error: 'User already registered.' });

    // create user
    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    await user.calculateHash();
    await user.save();

    // send responce to user
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).json(_.pick(user, ['_id', 'name', 'email']));
});

router.get('/me', auth, async (req, res)=>{

    // find the user
    const user = await User.findOne({
        _id: req.user._id
    });
    if(!user) return res.status(400).json({ error: 'The user deleted or deactived.' });

    res.json(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;