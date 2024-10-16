const mongoose = require('mongoose');
const chat = require('./chat');


const schema = mongoose.Schema;

const User = new schema({
    name : {type : String, required : true},
    email : {type : String, required : true, length: {min : 10}},
    password : {type : String , required : true},
    chats : [{type : schema.Types.ObjectId, ref : 'Chats'}],
    // socketId : {type : String, required : true, default : ''}
})

module.exports = mongoose.model('User',User);


