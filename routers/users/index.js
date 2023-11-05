const express = require('express');
const router = express.Router();
const userController = require('./users.controller.js');

router.get('/', userController.getAllUsers);

module.exports = router;