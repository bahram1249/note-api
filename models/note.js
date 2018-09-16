const mongoose = require('mongoose');
const Joi = require('joi');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 1,
        maxlength: 256,
        required: true
    },
    text: {
        type: String,
        minlength: 1,
        maxlength: 1256,
        required: true
    },
    dateCreate: {
        type: Date,
        default: Date.now()
    },
    dateReminder: {
        type: Date
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }
});

const Note = mongoose.model('Note', noteSchema);

function validateNote(note){

    const schema = {
        title: Joi.string().min(1).max(256).required(),
        text: Joi.string().min(1).max(1256).required(),
        dateReminder: Joi.date()
    }

    return Joi.validate(note, schema);
}

module.exports.Note = Note;
module.exports.validate = validateNote;