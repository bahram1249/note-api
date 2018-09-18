const request = require('supertest');
const { User } = require('../../../models/user');
const { Note } = require('../../../models/note');
const mongoose = require('mongoose');
let server;

describe('/api/notes', ()=>{

    beforeAll(()=>{
        server = require('../../../index');
    });

    afterAll(async ()=>{
        await server.close();
    });

    afterEach(async ()=>{
        await User.remove({});
        await Note.remove({});
    });

    // create a new test user
    let token;
    let userId;
    async function createUser(){
        userId = new mongoose.Types.ObjectId().toHexString();
        const user = new User({
            _id: userId,
            name: 'bahram',
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        });
        token = user.generateAuthToken();
        await user.save()
    }

    //create a new test note
    async function createNote(){
        return await request(server)
                .post('/api/notes')
                .set('x-auth-token', token)
                .send({
                    title: 'test title',
                    text: 'test text',
                    dateReminder: Date.now()
                });
    }

    describe('/POST /api/notes', ()=>{

        it('Should create a note', async ()=>{

            // create a user first
            await createUser();

            // create a note
            const note = await createNote();
            
            expect(note.status).toBe(200);
            expect(note.body.user).toBe(userId);
            expect(note.body.dateReminder).toBeDefined();
            expect(note.body.title).toBeDefined();
            expect(note.body.text).toBeDefined();
        });
    
        it('Should not create note without login', async ()=>{
    
            // create a note
            token = '';
            const note = await createNote()
    
            expect(note.status).toBe(401);
        });
    });

    describe('/GET /api/notes/:id', ()=>{

        it('/GET with token', async ()=>{

            // create a user
           await createUser();
    
            // create a note
            const note = await createNote()
    
            const res = await request(server)
                .get('/api/notes/' + note.body._id)
                .set('x-auth-token', token);
    
            expect(res.status).toBe(200);
            expect(res.body.text).toBe(note.body.text);
            expect(res.body.title).toBe(note.body.title);
            expect(new Date(res.body.dateReminder)).toMatchObject(new Date(note.body.dateReminder));
            expect(res.body.user).toBe(userId);
        });

        it('/GET without token', async ()=>{

            // create a user
            await createUser();
            // create a note
            const note = await createNote()

            const res = await request(server)
                .get('/api/notes/' + note.body._id);

            expect(res.status).toBe(401);
        });

    });

    describe('/DELETE /api/notes', ()=>{

        it('/DELETE /api/notes', async ()=>{

            // create user
            await createUser();
    
            // create some note
            const length = 4
            for (let i = 0; i < length; i++) {
                await createNote(); 
            }
            
            let notes = await Note.find({
                user: userId
            });

            expect(notes.length).toBe(length);

            const res = await request(server)
                    .delete('/api/notes')
                    .set('x-auth-token', token);
    
            notes = await Note.find({
                user: userId
            });

            expect(res.status).toBe(200);
            expect(notes.length).toBe(0);
        });

        it('/DELETE /api/notes/:id', async ()=>{

            // create user
            await createUser();
    
            // create note
            const note = await createNote();

            const res = await request(server)
                    .delete('/api/notes/' + note.body._id)
                    .set('x-auth-token', token);

            expect(res.body.title).toBe(note.body.title);
            expect(res.body.text).toBe(note.body.text);
            expect(res.body.user).toBe(userId);
            expect(res.status).toBe(200);
        });
    });



});