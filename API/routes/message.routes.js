const express = require("express");
const router = express.Router();
const controllers = require("../controller/message/message.controller");
const { authenticateJWT } = require("../middleware/auth");

router
  .route("/getAllMessages/:userId/:senderId")
  .get(authenticateJWT, controllers.getAllMessages);

router
  .route(`/editmessage/:msgId`)
  .patch(authenticateJWT, controllers.editMessage);

router
  .route("/deletemessages/:msgId")
  .delete(authenticateJWT, controllers.deleteMessage);

router
  .route("/deleteallmessages/userId=:userId&senderId=:senderId")
  .delete(authenticateJWT, controllers.deleteAllMessages);

module.exports = router;
