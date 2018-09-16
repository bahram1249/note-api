const { validate } = require('../../../models/user');

describe('User models => validateUser', ()=>{
    
    it('Should be validate with this details', ()=>{

        const user = {
            name: 'bahram',
            email: 'bahram@gmail.com',
            password: '123456'
        }

        const { error } = validate(user);

        expect(error).not.toBeDefined();
        expect(error).toBeFalsy();

    });

    it('Should be error if name less than 3 character', ()=>{

        let user = {
            name: 'a',
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }

        let { error } = validate(user);

        expect(error).toBeDefined();  
    });

    it('Should be error if name not defined', ()=>{

        const user = {
            email: 'bahram.rajabiws@gmail.com',
            password: '123456'
        }

        const { error } = validate(user);

        expect(error).toBeDefined();
    });

    it('Should be error if email not defined', ()=>{

        const user = {
            name: 'bahram',
            password: '123456'
        }

        const { error } = validate(user);

        expect(error).toBeDefined();
    });

    it('Should be error if password not defined', ()=>{

        const user = {
            name: 'bahram',
            email: 'bahram.rajabiws@gmail.com'
        }

        const { error } = validate(user);

        expect(error).toBeDefined();
    });

    it('Should be error if password less than 6 characters', ()=>{

        const user = {
            name: 'bahram',
            email: 'bahram.rajabiws@gmail.com',
            password: '12345'
        }

        const { error } = validate(user);

        expect(error).toBeDefined();
    });

    it('Should be error if email is invalid', ()=>{

        const user = {
            name: 'bahram',
            email: 'bahram.rajabiws@gmail',
            password: '123456'
        }

        const { error } = validate(user);

        expect(error).toBeDefined();
    });
});