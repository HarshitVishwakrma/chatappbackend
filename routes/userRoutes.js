const express = require('express');
const router = express.Router();

const userController = require('../controller/userController')
const {isAuthenticated} = require('../controller/authController')

router.get('/userConnectionInfo',isAuthenticated, userController.getUserConnections);

router.get('/getUsers', isAuthenticated, userController.getUsers )

module.exports = router;