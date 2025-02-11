const Chat = require("../model/chat");
const bucket = require("../firebase");

const userSockets = {}; // Stores userId and corresponding socketId

exports.handleSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSockets[userId] = socket.id;
      console.log(`User connected: userId=${userId}, socketId=${socket.id}`);
    } else {
      console.error("User ID is missing in the connection handshake.");
      return;
    }

    socket.on("message", async (data) => {
      if (!data.chatId || !data.message) {
        console.error("Invalid message data:", data);
        return;
      }

      try {
        const message = await onMessage(data.chatId, data.message);
        io.emit("received", { newMessage: message, chatId: data.chatId });
      } catch (error) {
        console.error("Error handling message event:", error);
      }
    });

    socket.on("liveMessage", (data) => {
      if (data.to && userSockets[data.to]) {
        io.to(userSockets[data.to]).emit("liveMessageReceived", { message: data.message });
      } else {
        console.error(`User with ID ${data.to} is not connected.`);
      }
    });

    socket.on("imageMessage", async (data) => {
      if (!data.chatId || !data.file || !data.fileName || !data.fileType) {
        console.error("Invalid image message data:", data);
        return;
      }

      try {
        const message = await onImageMessage(data.chatId, data.message, data.file, data.fileName, data.fileType, io);
        console.log("Image message processed:", message);
      } catch (error) {
        console.error("Error handling image message event:", error);
      }
    });

    socket.on("disconnect", () => {
      if (userId && userSockets[userId]) {
        console.log(`User disconnected: userId=${userId}`);
        delete userSockets[userId]; // Remove the user from userSockets
      }
    });
  });
};

// Helper Functions
async function onMessage(chatId, message) {
  try {
    const chats = await Chat.findOne({ _id: chatId });
    if (!chats) {
      console.error("Chat not found for chatId:", chatId);
      return;
    }

    chats.messages.push({ text: message.text, sender: message.sender });
    const response = await chats.save();
    console.log("Message saved successfully:", response);
    return { text: message.text, sender: message.sender, time: new Date() };
  } catch (error) {
    console.error("Error in onMessage:", error);
    throw error;
  }
}

async function onImageMessage(chatId, message, file, fileName, fileType, io) {
  try {
    const buffer = Buffer.from(file); // Convert ArrayBuffer to Buffer

    const fileRef = bucket.file(fileName);
    const stream = fileRef.createWriteStream({
      metadata: { contentType: fileType },
    });

    stream.on("error", (err) => {
      console.error("File upload error:", err);
    });

    stream.on("finish", async () => {
      console.log(`File successfully uploaded: ${fileName}`);

      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/chatapplication-fefe7.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;

      const chats = await Chat.findOne({ _id: chatId });
      if (!chats) {
        console.error("Chat not found for chatId:", chatId);
        return;
      }

      chats.messages.push({ text: message.text || "", sender: message.sender, fileUrl: fileUrl });
      const response = await chats.save();
      console.log("Chat saved successfully:", response);

      const res = { text: message.text || "", fileUrl: fileUrl, sender: message.sender, time: new Date() };

      io.emit("received", { newMessage: res, chatId: chatId });
      return res;
    });

    stream.end(buffer);
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
}
