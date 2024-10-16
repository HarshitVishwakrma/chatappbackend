const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const Chat = require('./model/chat');
const chatController = require('./controller/chatController')
const {handleSocket} = require('./controller/socketController');


const CONNECTION_STRING = process.env.MONGO_URI
  

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(authRoutes);
app.use(userRoutes);
app.use(chatRoutes);



handleSocket(io);

 

const PORT = process.env.PORT || 3000;
mongoose.connect(CONNECTION_STRING)
.then(()=>{
    console.log('connected to the database')
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})