const Message = require("../../models/message.model");

const getAllMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const senderId = req.params.senderId;

    const messages = await Message.find({
      $or: [
        { $and: [{ senderId: userId }, { recipientId: senderId }] },
        { $and: [{ senderId: senderId }, { recipientId: userId }] }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getAllMessages;
