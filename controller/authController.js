const User = require('../model/user');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) =>{
    const {email, password} = req.body;
    console.log('requiest reached')

    try{
        const user = await User.findOne({email : email});
        if(!user){
            return res.status(404).json({message : 'error 404, User not found.'})
        }
        if(user.password !== password){
            return res.status(400).json({message : 'Invalid password or email.'});
        }

        const token =  jwt.sign({user : user},'secret');

        res.status(200).json({user : user, token : token});   
    }catch(error){
        console.log(error);
        res.status(500).json({
            error : error
        })
    }
}

exports.signup = async (req, res) =>{
    try{
        const {email, name, password } = req.body;

        const userExist = await User.findOne({email : email})
        if(userExist){
            return res.status(400).json({message : 'User with this email already exist!. Try to login. '});
        }

        const newUser = new User({
            email : email,
            name : name,
            password : password,
            chats : []
        })

        const response = await newUser.save();
        if(!response){
            return res.status(400).json({'message': 'something went wrong'})
        }
        const token =  jwt.sign({user : user},'secret');

        res.status(201).json({message : 'new user created.', user : response, token : token});
    }catch(error){
        console.log(error);
        res.status(500).json({message : 'something went wrong', error : error})
    }
}

exports.isAuthenticated = async (req, res, next)=>{
    try{
        const authToken = req.get('Authorization').split(" ")[1];
        if(!authToken || authToken.trim().length == 0){
            return res.status(401).json({message : 'User not authenticated. Please login to continue...'});
        }

        const user = jwt.verify(authToken, 'secret');
        req.user = user.user;
        console.log(req.user)
    
        next()
    }catch(error){
        console.log(error);
        res.status(500).json({message : 'something went wrong', error : error})
    }
}