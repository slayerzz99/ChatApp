const Message = require("../../models/message.model");

const deleteMessage = async (req, res) => {
  try {
    const msgId = req.params.msgId;

    const messages = await Message.findByIdAndDelete(msgId);
    if (!messages) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      messages: messages,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteMessage;
