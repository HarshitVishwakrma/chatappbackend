const mongoose = require('mongoose');
const user = require('./user')

const schema = mongoose.Schema;

const Message = new schema({
  text : {type : String},
  timeStamp : {type : Date, default : Date.now()},
  sender : {type : String, required : true},
  fileUrl : {type : String}
})



const Chats = new schema({
  sender : {
    type : mongoose.Types.ObjectId,
    ref : 'User'
  },
  receiver : {
    type : mongoose.Types.ObjectId,
    ref : 'User'
  },
  // messages : [{type : String, default : []}]
  messages : [Message]
})



module.exports = mongoose.model('Chats',Chats)