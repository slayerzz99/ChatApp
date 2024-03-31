const Message = require("../../models/message.model");

const editMessage = async (req, res) => {
  try {
    const msgId = req.params.msgId;
    const msg = req.body.message;

    const messageUpdate = await Message.findByIdAndUpdate(msgId, {
      message: msg
    });

    if (!messageUpdate) {
      return res.status(404).json({ message: "Message not found" });
    }

    const messageUpdated = await Message.findById(msgId);

    res.status(200).json({
      messages: messageUpdated,
      message: "Message Updated successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = editMessage;
