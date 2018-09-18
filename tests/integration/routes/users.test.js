const request = require('supertest');
const { User } = require('../../../models/user');
const bcrypt = require('bcrypt');
let server;


describe('Users routes', ()=>{

    beforeEach(()=>{
        server = require('../../../index');
    });
    afterEach(async ()=>{
        await User.remove({});
        await server.close();
    });

    let name = 'bahram';
    async function createUser(){
        const res = await request(server)
                        .post('/api/users')
                        .send({
                            name,
                            email: 'bahram.rajabiws@gmail.com',
                            password: '123456'
                        });
        return res;
    }

    it('Should create user successfully', async()=>{

        const res = await createUser();

        expect(res.status).toBe(200);
    });

    it('Should status code be 400 if the user with this given email is existed before', async()=>{

        await createUser();

        const res = await createUser();

        expect(res.status).toBe(400);
    });

    it('Should status code be 400 if the body of request not correct', async()=>{

        name = 'a';
        const res = await createUser();

        name = 'bahram';

        expect(res.status).toBe(400);
    });

    it('/GET /api/users/me', async()=>{

        const user = await createUser();
        const token = user.get('x-auth-token');

        const res = await request(server)
            .get('/api/users/me')
            .set('x-auth-token', token);
        
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(user.body._id);
    });

    it('/GET /api/users/me should be 400 if user deleted or deactived', async()=>{

        const user = new User({
            name: 'bahram',
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        });
        const token = user.generateAuthToken();
        // don't add user.save() => should be not saved in database !

        const res = await request(server)
            .get('/api/users/me')
            .set('x-auth-token', token);
        
        expect(res.status).toBe(400);
    });

    it('Should be hashed password', async ()=>{
        
        const password = '123456';
        const res = await createUser();

        const user = await User.findById(res.body._id);
        const validPassword = bcrypt.compare(password, user.password);
        
        expect(validPassword).toBeTruthy();
    });
});