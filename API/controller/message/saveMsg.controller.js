const Message = require("../../models/message.model");

async function saveMessageToDatabase(senderId, recipientId, msg) {
  const newMessage = new Message({
    senderId: senderId,
    recipientId: recipientId,
    message: msg,
    timestamp: Date.now()
  });
  await newMessage.save();
}

module.exports = saveMessageToDatabase;
