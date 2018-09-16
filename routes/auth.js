const { User } = require('../models/user');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');


router.post('/', async(req, res)=>{
    // validate login fields
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // find the user with this given email
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Invalid Email or Password');

    // check if the password is true
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid Email or Password');

    // if every thing is ok send the authentication
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(token);
});

function validate(user){

    const schema = {
        email: Joi.string().regex(/^[a-zA-Z0-9_%+.-]+@[a-zA-Z0-9_.-]+[.][a-z-A-Z]{2,}$/).required(),
        password: Joi.string().min(6).max(256).required()
    }

    return Joi.validate(user, schema);
}

module.exports = router;