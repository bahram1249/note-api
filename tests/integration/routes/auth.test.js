const request = require('supertest');
const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
let server;

describe('/api/auth routes', ()=>{

    beforeAll(()=>{
        server = require('../../../index');
    });
    afterAll(async ()=>{
        await server.close();
    });
    
    afterEach(async ()=>{
        await User.deleteMany({});
    });

    async function createUser(){
        return await request(server)
                        .post('/api/users')
                        .send({
                            name: 'bahram',
                            email: 'bahram.rajabiws@gmail.com',
                            password: '123456'
                        });
    }

    async function auth(userLogin){
        return await request(server)
                        .post('/api/auth')
                        .send(userLogin);
    }

    it("Should be 400 if required body params not send it", async ()=>{

        const userLogin = {
            email: 'bahram.rajabiws@gmail.com'
        }
        
        const res = await auth(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be 400 if the email not existed", async ()=>{

        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }
        
        const res = await auth(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be 400 if the password not equal", async ()=>{

        let res = await createUser();
        expect(res.status).toBe(200);
        
        
        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '1234567'
        }
        
        res = await auth(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be send it token", async ()=>{

        let res = await createUser();
        expect(res.status).toBe(200);
        
        
        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }
        
        res = await auth(userLogin);

        const token = res.get('x-auth-token');
        const decoded = jwt.verify(token, config.get('jsonwebtoken.privateKey'));

        expect(decoded).toBeTruthy();
        expect(res.status).toBe(200);
    });

});