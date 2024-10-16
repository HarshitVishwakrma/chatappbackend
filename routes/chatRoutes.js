const express = require('express');
const chatController = require('../controller/chatController')
const {isAuthenticated} = require('../controller/authController')

const router = express.Router();

router.get('/getChats', isAuthenticated, chatController.getChats);

module.exports = router;