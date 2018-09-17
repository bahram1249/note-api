const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validateObjectId = require('../middlewares/validateObjectId');
const { Note , validate } = require('../models/note');
const _ = require('lodash');
require('express-async-errors');

router.get('/', auth, async (req, res)=>{

    // get all notes
    const notes = await Note.find({
        user: req.user._id
    }).sort('-dateCreate')
    .select('-__v');

    res.send(notes);
});

router.post('/', auth, async (req, res)=>{

    // validate note
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // create note
    let note = _.pick(req.body, ['title', 'text', 'dateReminder']);
    note.user = req.user._id;
    note = new Note(note);
    await note.save();

    // send note to client
    res.send(_.pick(note, ['_id','title', 'text', 'dateCreate', 'dateReminder', 'user']));
});

router.delete('/', auth, async (req, res)=>{

    // delete all notes
    await Note.remove({
        user: req.user._id
    });
    
    res.send('All notes deleted.');
});

router.get('/:id', [auth, validateObjectId], async (req, res)=>{

    // find the note with this given id
    const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id
    });
    if(!note) return res.status(404).send('The note with this given id not found.');

    // send note to client
    res.send(_.pick(note, ['_id', 'title', 'text', 'dateCreate', 'dateReminder', 'user']));
});

router.put('/:id', [auth, validateObjectId], async (req, res)=>{

    // validate note
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

   // find the note with this given id
   let note = await Note.findOne({
       _id: req.params.id,
       user: req.user._id
   });
   if(!note) return res.status(404).send('The note with this given id not found.');

   // update to new note
   note.title = req.body.title;
   note.text = req.body.text;
   if(req.body.dateReminder) note.dateReminder = req.body.dateReminder;
   else note.dateReminder = undefined;
   await note.save();

   // send note to client
   res.send(_.pick(note, ['_id', 'title', 'text', 'dateCreate', 'dateReminder', 'user']));

});

router.delete('/:id', [auth, validateObjectId], async(req, res)=>{

    // find the note with this given id
    const note = await Note.findOneAndRemove({
        _id: req.params.id,
        user: req.user._id
    });
    if(!note) return res.status(404).send('The note with this given id not found.');

    res.send(_.pick(note, ['_id', 'title', 'text', 'dateCreate', 'dateReminder', 'user']));
});

module.exports = router;