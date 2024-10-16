const jwt = require("jsonwebtoken");

const Chats = require("../model/chat");
const User = require('../model/user');

exports.getChats = async (req, res, next) => {
  try{
    const user1Id = req.user._id;
    // const user2Id = req.body.receiver;
    const user2Id = req.query.receiver;

    const user1 = await User.findById(user1Id).select('chats');
    const user2 = await User.findById(user2Id).select('chats');

    if(!user1 || !user2){
      throw new Error('one or both user not found');
    }
    console.log(user1);
    console.log(user2);
    console.log('here')

    const commonChatId = user1.chats.find(chat => user2.chats.includes(chat));

    if(!commonChatId){

      return res.json({})
    }

    const chat = await Chats.findOne({_id : commonChatId}).populate(['receiver', 'sender']);
    res.status(200).json(chat)

  } catch (error) {
    console.log("something went wrong, chat controller line no.17");
    console.log(error);
    res.status(501).json({ error: error });
  }
};


