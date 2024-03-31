const Message = require("../../models/message.model");

const deleteAllMessages = async (req, res) => {
  try {
    const { userId, senderId } = req.params;

    const messages = await Message.deleteMany({
      $or: [
        { $and: [{ senderId: userId }, { recipientId: senderId }] },
        { $and: [{ senderId: senderId }, { recipientId: userId }] }
      ]
    });

    if (!messages) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      messages: `${messages.deletedCount} deleted successfully`,
      message: "Messages deleted successfully"
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteAllMessages;
