const express = require('express');
const User = require('./users.model');
const customError = require('../../customError');
const router = express.Router();

// Data validation
const validateUserData = ('/', (req, res, next) => {
    // data validation
    if (!req.body.userID) {
        return next(new customError(400, 'User name required.'));
    } else if (!req.body.email) {
        return next(new customError(400, 'User email required.'));
    } else if (!req.body.password) {
        return next(new customError(400, 'Logon password required.'));
    }
    next();  // If valid, proceed to the route handler
});

// Get all users
router.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Append a user to database
router.post('/', validateUserData, (req, res, next) => {
    const newUser = new User(req.body);
    newUser.save()
        .then(user => res.json(user))
        .catch(err => next(new CustomerError(400, 'Error: ' + err)));
});

// Update user record
router.put('/:id', validateUserData, (req, res, next) => {
    const userID = req.params.id;
    User.findByIdAndUpdate(userID, req.body, { new: true})
        .then(updatedUser => res.json(updatedUser))
        .catch(err => next(new CustomerError(400, 'Error: ' + err)));
});

// Delete user record

module.exports = router;