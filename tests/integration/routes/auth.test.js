const request = require('supertest');
const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
let server;

describe('/api/auth routes', ()=>{

    beforeEach(()=>{
        server = require('../../../index');
    });
    afterEach(async ()=>{
        await User.remove({});
        await server.close();
    });

    it("Should be 400 if required body params not send it", async ()=>{

        const userLogin = {
            email: 'bahram.rajabiws@gmail.com'
        }
        
        const res = await request(server)
                            .post('/api/auth')
                            .send(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be 400 if the email not existed", async ()=>{

        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }
        
        const res = await request(server)
                            .post('/api/auth')
                            .send(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be 400 if the password not equal", async ()=>{

        let res = await request(server)
                            .post('/api/users')
                            .send({
                                name: 'bahram',
                                email: 'bahram.rajabiws@gmail.com',
                                password: '123456'
                            });
        expect(res.status).toBe(200);
        
        
        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '1234567'
        }
        
        res = await request(server)
                            .post('/api/auth')
                            .send(userLogin);

        expect(res.status).toBe(400);
    });

    it("Should be send it token", async ()=>{

        let res = await request(server)
                            .post('/api/users')
                            .send({
                                name: 'bahram',
                                email: 'bahram.rajabiws@gmail.com',
                                password: '123456'
                            });
        expect(res.status).toBe(200);
        
        
        const userLogin = {
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }
        
        res = await request(server)
                            .post('/api/auth')
                            .send(userLogin);

        const token = res.get('x-auth-token');
        const decoded = jwt.verify(token, config.get('jsonwebtoken.privateKey'));

        expect(decoded).toBeTruthy();
        expect(res.status).toBe(200);
    });

});