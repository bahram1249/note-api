const validObjectId = require('../../../middlewares/validateObjectId');
const mongoose = require('mongoose');

describe('validObjectId middlewares', ()=>{

    it('Should be valid objectId if put right', ()=>{

        const req = {
            params: {
                id: mongoose.Types.ObjectId()
            }
        }
        const res = {}
        const next = jest.fn();
        validObjectId(req, res, next);


        expect(next).toBeCalled();
    });

    it('Should be invalid if objectId putting wrong', ()=>{

        const req = {
            params: {
                id: 'a'
            }
        }

        const res = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        }

        const next = jest.fn();

        validObjectId(req, res, next);

        expect(res.status).toBeCalled();
        expect(res.send).toBeCalled();
        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith('Invalid ID');
        expect(next).not.toBeCalled();
    });
});