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
        await User.deleteMany({});
        await Note.deleteMany({});
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

    // update a note
    async function updateNote(noteId, newNote){
        return await request(server)
                .put('/api/notes/' + noteId)
                .set('x-auth-token', token)
                .send(newNote);
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

        it('Should not create a note if not valid parameter.', async ()=>{

            // create user for generate token
            await createUser();

            const res = await request(server)
                            .post('/api/notes')
                            .set('x-auth-token', token);
            
            expect(res.status).toBe(400);
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

        it('/GET not found if note id not exist.', async ()=>{

            // create a user for generate token
           await createUser();
            
           // request a note not existed before or deleted!.
           const res = await request(server)
                            .get('/api/notes/'+ new mongoose.Types.ObjectId().toHexString())
                            .set('x-auth-token', token);
            
            expect(res.status).toBe(404);
            
        });

    });

    it('/GET /api/notes', async ()=>{

        // create a user for generate token
        await createUser();

        // create some note
        const length = 4
        for(let i = 0; i < length;i++){
            await createNote();
        }

        // fetch all notes
        const res = await request(server)
                        .get('/api/notes')
                        .set('x-auth-token', token);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(length);
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

        it('/DELETE /api/notes/:id with Invalid note id ', async ()=>{

            // create user for generate token
            await createUser();

            const res = await request(server)
                    .delete('/api/notes/' + new mongoose.Types.ObjectId().toHexString())
                    .set('x-auth-token', token);
            
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/notes/:id', ()=>{

        it('Should be update note', async ()=>{

            // create user
            await createUser();

            // create note
            const note = await createNote();

            // update note
            const newNote = {
                title: 'test title 2',
                text: 'test text 2',
                dateReminder: Date.now()
            }
            const res = await updateNote(note.body._id, newNote); 

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(note.body._id);
            expect(res.body.title).toBe(newNote.title);
            expect(res.body.text).toBe(newNote.text);
            expect(new Date(res.body.dateReminder)).toMatchObject(new Date(newNote.dateReminder));
        });

        it('Should not updated note if parameter is not valid', async ()=>{

            // create user for generate token
            await createUser();

            // create a note
            const note = await createNote();

            // update note
            const newNote = {
                title: 'test title 2'
            }

            const res = await updateNote(note.body._id, newNote); 

            expect(res.status).toBe(400);
        });

        it('Should send 404 if the note id not existed before', async ()=>{

            // create user for generate token
            await createUser();


            // new updated note
            const newNote = {
                title: 'test title 2',
                text: 'test text 2'
            }

            const res = await updateNote(new mongoose.Types.ObjectId().toHexString(), newNote); 

            expect(res.status).toBe(404);
        });

        it('Should deleted dateReminder if in new body not exist', async ()=>{

            // create user for generate token
            await createUser();

            // create a note
            const note = await createNote();

            // update note without dateReminder
            const newNote = {
                title: 'test title 2',
                text: 'test text 2'
            }
            const res = await updateNote(note.body._id, newNote); 

            expect(res.status).toBe(200);
            expect(res.body.dateReminder).not.toBeDefined();
        });
    });


});