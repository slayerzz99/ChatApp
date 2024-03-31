const getAllMessages = require("./getAllMsg.controller");
const editMessage = require("./editMsg.controller");
const deleteAllMessages = require("./deleteAllMsg.controller");
const deleteMessage = require("./deleteMsg.controller");
const saveMessageToDatabase = require("./saveMsg.controller");

module.exports = {
  getAllMessages,
  editMessage,
  deleteAllMessages,
  deleteMessage,
  saveMessageToDatabase
};
