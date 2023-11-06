const express = require('express');
const User = require('./users.model');
const customError = require('../../customError');
const router = express.Router();

// Data validation
const validateUserData = (req, res, next) => {
    // basic data validation
    if (!req.body.userID) {
        return next(new customError(400, 'User name required.'));
    } else if (!req.body.email) {
        return next(new customError(400, 'User email required.'));
    } else if (!req.body.password) {
        return next(new customError(400, 'Logon password required.'));
    }
    next();  // If valid, proceed to the route handler
};

// Get one users
router.get('/:id', (req, res, next) => {
    User.findById(req.params.id)
        .then(users => res.json(users))
        .catch(err => next(new customError(400, 'Error: ' + err)));
});

// Get all users
router.get('/', (req, res, next) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => next(new customError(400, 'Error: ' + err)));
});

// Append a user to database
router.post('/', validateUserData, async (req, res, next) => {
    try{
        // check if user ID already exist
        const existUser = await User.findOne({ userID: req.body.userID });
        if(existUser){
            return next(new customError(409, 'User ID ' + req.body.userID + ' already exist'))
        }
        const newUser = new User(req.body);
        newUser.save()
            .then(user => res.json(user))
            .catch(err => next(new customError(400, 'Error: ' + err)));
    } catch {
        next(new customError(500, 'Append user error: ' + err.message));
    }
});

// Update one user record by userID
router.put('/:id', validateUserData, async (req, res, next) => {
    try{
        const userID = req.params.id;
        delete req.body.userID;     //delete field userID from body to ensure userID cannot make change
        const updatedUser = await User.findByIdAndUpdate(userID, req.body, { new: true });
        if(!updatedUser) {
            return next(new customError(404, 'User not found'));
        }
        res.json(updatedUser);
    } catch (err) {
        next(new customError(500, 'Update user error:' + err.message ))
    }
});

// Delete one user record by field UserID instead of record object ID
router.delete('/:userID', async (req, res, next) => {
    console.log("Attempting to delete user:", req.params.userID);
    const existUser = await User.findOne({ userID: req.params.userID });
    if(existUser){
        const objID = existUser.id;
        console.log('Object ID found:', objID);
        try {
            const user = await User.findByIdAndDelete(objID);
            if (!user) {
                return next(new customError(404, 'User obj ' + objID + 'not found.'));
            }
            res.status(200).json({ message: 'User ' + existUser + ' has been deleted.' });
        } catch (err) {
            next(new customError(500, err));
        }
    } else {
        return next(new customError(404, 'User ' + existUser + 'not found.'));
    }
});

module.exports = router;