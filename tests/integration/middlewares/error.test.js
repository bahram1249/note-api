const request = require('supertest');
const mongoose = require('mongoose');
const config = require('config');

describe('./middlewares/error.js', ()=>{

    beforeEach(()=>{
        server = require('../../../index');
    });
    afterEach(async ()=>{
        await mongoose.connect(config.get('db.address'));
        await server.close();
    });

    it('Should be internal server error if mongoodb shutdown', async ()=>{
        mongoose.connection.close();

        const user = {
            name: 'bahram',
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }

        const res = await request(server)
                        .post('/api/users')
                        .send(user);
        
        expect(res.status).toBe(500);
    });
});