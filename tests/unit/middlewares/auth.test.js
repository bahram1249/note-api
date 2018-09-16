const mongoose = require('mongoose');
const auth = require('../../../middlewares/auth');
const { User } = require('../../../models/user');
const _ = require('lodash');


describe("auth middlewares", ()=>{

    it("Should populate req.user with the payload of valid JWT", ()=>{

        const id = new mongoose.Types.ObjectId().toHexString();
        const user = new User({
            _id: id
        });

        const token = user.generateAuthToken();

        const req = {
            header: jest.fn().mockReturnValue(token)
        }

        const res = {}
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user._id).toBe(id);
    });

    it("Should be rejected if token not provided", ()=>{

        const req = {
            header: jest.fn()
        }
        const res = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        }
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toBeCalledWith(401);
        expect(res.send).toBeCalledWith('Access denied. No token provided.');
    });

    it("Should be Invalid Token if token is invalid", ()=>{

        token = 'a';

        const req = {
            header: jest.fn().mockRejectedValue(token)
        }
        const res = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        }
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith('Invalid Token');
    })
});
