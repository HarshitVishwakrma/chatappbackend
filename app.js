const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const Chat = require('./model/chat');
const { handleSocket } = require('./controller/socketController');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);
app.use(userRoutes);
app.use(chatRoutes);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5174',
    credentials: true
  }
});

// Handle Socket.IO connections
handleSocket(io);

// Connect to MongoDB and start the server
const CONNECTION_STRING = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(CONNECTION_STRING)
  .then(() => {
    console.log('Connected to the database');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
