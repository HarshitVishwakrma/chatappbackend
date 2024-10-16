const Chat = require("../model/chat");
const bucket = require("../firebase");

const userSockets = {};

exports.handleSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    userSockets[userId] = socket.id;

    console.log(
      `user with userId : ${userId} connected with socket Id : ${userSockets[userId]}`
    );

    console.log(socket.id);
    socket.on("message", async (data) => {
      const message = await onMessage(data.chatId, data.message);
      io.emit("received", {
        newMessage: message,
        chatId: data.chatId,
      });
    });

    socket.on("liveMessage", (data) => {
      console.log(data);
      console.log(userSockets[data.to]);
      io.to(userSockets[data.to]).emit("liveMessageReceived", {
        message: data.message,
      });
    });

    socket.on("imageMessage", async (data) => {
      console.log("Received image message:", data);

      // Call the function to handle the file upload
      const message = await onImageMessage(data.chatId, data.message, data.file, data.fileName, data.fileType, io);

      // io.emit("received", {
      //   newMessage: message,
      //   chatId: data.chatId,
      // });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      delete userSockets[userId]; // Clean up when the user disconnects
    });
  });
};

// functions to controll the setup :

async function onMessage(chatId, message) {
  try {
    const chats = await Chat.findOne({ _id: chatId });
    chats.messages = [...chats.messages, {text : message.text, sender : message.sender}];
    const response = await chats.save();
    console.log(response);
    return {text : message.text}
  } catch (error) {
    console.log(error);
  }
}

async function onImageMessage(chatId, message, file, fileName, fileType, io) {
  try {
    const buffer = Buffer.from(file); // Convert ArrayBuffer to Buffer

    const fileRef = bucket.file(fileName); // Use fileName from client
    const stream = fileRef.createWriteStream({
      metadata: { contentType: fileType }, // Set the MIME type
    });

    stream.on("error", (err) => {
      console.error("File upload error:", err);
    });

    stream.on("finish", async () => {
      console.log(`File successfully uploaded: ${fileName}`);

      // Generate the public URL for the file
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/chatapplication-fefe7.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;

      // Find the chat and update with the new message
      const chats = await Chat.findOne({ _id: chatId });
      chats.messages.push({ text: message.text, sender: message.sender, fileUrl: fileUrl });
      const response = await chats.save();

      console.log("Chat saved successfully:", response);

      // Prepare the message object
      const res = { text: message.text || "", fileUrl: fileUrl, sender: message.sender, time: new Date() };

      // Emit the message to all clients using io
      io.emit("received", { newMessage: res, chatId: chatId });

      return res;
    });

    stream.end(buffer); // Write the buffer to the storage

  } catch (error) {
    console.error("Error during file upload:", error);
  }
}





// async function onImageMessage(chatId, message, file, fileName, fileType) {
//   try {
//     const buffer = Buffer.from(file); // Convert ArrayBuffer to Buffer

//     const fileRef = bucket.file(fileName); // Use fileName from client
//     const stream = fileRef.createWriteStream({
//       metadata: { contentType: `${fileType}` }, // Adjust MIME type if necessary
//     });

//     stream.on("error", (err) => console.error(err));
//     stream.on("finish", () => console.log(`File uploaded: ${fileName}`));

//     stream.end(buffer); // Write file data to Firebase Storage

//     const fileUrl = `https://firebasestorage.googleapis.com/v0/b/chatapplication-fefe7.appspot.com/o/${fileName}?alt=media`

//     const chats = await Chat.findOne({ _id: chatId });
//     chats.messages = [...chats.messages, {text : message.text, sender : message.sender, fileUrl : fileUrl}];
//     const response = await chats.save();
//     console.log(response);

//     const res = {text : message.text, fileUrl : fileUrl}
//     return res;
    
//   } catch (error) {
//     console.error("File upload error:", error);
//   }
// }
