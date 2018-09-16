const request = require('supertest');
const { User } = require('../../../models/user');
const { Note } = require('../../../models/note');
const mongoose = require('mongoose');
let server;

describe('/api/notes', ()=>{

    beforeEach(()=>{
        server = require('../../../index');
    });
    afterEach(async ()=>{
        await User.remove({});
        await Note.remove({});
        await server.close();
    });

    describe('/POST /api/notes', ()=>{

        it('Should create a note', async ()=>{

            // create a user first
            const id = new mongoose.Types.ObjectId().toHexString();
            let user = new User({
                _id: id,
                name: 'bahram',
                email: 'bahram.rajabiws@gmail.com',
                password: '123456'
            });
            const token = user.generateAuthToken();
            await user.save();
    
            // create a note
            let note = {
                title: 'test title',
                text: 'test text',
                dateReminder: Date.now()
            }
            note = await request(server)
                .post('/api/notes')
                .set('x-auth-token', token)
                .send(note);
            
            expect(note.status).toBe(200);
            expect(note.body.user).toBe(id);
            expect(note.body.dateReminder).toBeDefined();
            expect(note.body.title).toBeDefined();
            expect(note.body.text).toBeDefined();
        });
    
        it('Should not create note without login', async ()=>{
    
            let note = {
                title: 'test title',
                text: 'test text',
                dateReminder: Date.now()
            }
            note = await request(server)
                .post('/api/notes')
                .send(note);
    
            expect(note.status).toBe(401);
        });
    });

    describe('/GET /api/notes/:id', ()=>{

        it('/GET with token', async ()=>{

            // create a user
            const userId = new mongoose.Types.ObjectId().toHexString();
            let user = new User({
                _id: userId,
                name: 'bahram',
                email: 'bahram.rajabiws@gmail.com',
                password: '123456'
            });
            const token = user.generateAuthToken();
            await user.save();
    
            // create a note
            const noteId = new mongoose.Types.ObjectId().toHexString();
            let note = new Note({
                _id: noteId,
                title: 'test title',
                text: 'test text',
                dateReminder: Date.now(),
                user: userId
            });
            await note.save();
    
            const res = await request(server)
                .get('/api/notes/' + noteId)
                .set('x-auth-token', token);
    
            expect(res.status).toBe(200);
            expect(res.body.text).toBe(note.text);
            expect(res.body.title).toBe(note.title);
            expect(new Date(res.body.dateReminder)).toMatchObject(note.dateReminder);
            expect(res.body.user).toBe(userId);
        });

        it('/GET without token', async ()=>{

            // create note 
            const userId = new mongoose.Types.ObjectId().toHexString();
            const noteId = new mongoose.Types.ObjectId().toHexString();
            let note = new Note({
                _id: noteId,
                title: 'test title',
                text: 'test text',
                dateReminder: Date.now(),
                user: userId
            });
            await note.save();

            const res = await request(server)
                .get('/api/notes/' + noteId);

            expect(res.status).toBe(401);
        });
    });
});