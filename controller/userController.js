const User = require('../model/user');

exports.getUserConnections = async (req, res)=>{
    try{
        const userData = await User.findOne({_id : req.user._id}).populate(['chats']);
        console.log(userData)
        const response = []
        for(let user in userData.chats){
            response.push({
                name : user.name,
                _id : user._id
            })
        }
        console.log(response)
        res.json({message : userData})
    }catch(error){
        console.log(error)
    }

}

exports.getUsers = async (req, res) =>{
    try{
        const users = await User.find({ _id: { $ne: req.user._id } });
        if(!users){
            throw new Error('no users found');
        }
        res.json(users);

    }catch(err){
        console.log(err);
    }
}