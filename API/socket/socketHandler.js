const jwt = require("jsonwebtoken");
const saveMessageToDatabase = require("../controller/message/saveMsg.controller");

module.exports = function(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Unauthorized: Invalid token"));
      }

      socket.decodedToken = decoded;
      next();
    });
  });

  const userSocketMap = {};

  io.on("connection", socket => {
    console.log("Socket connected:", socket.id);

    // Handle when a user sends a message
    socket.on("msg", async ({ msg, recipientId, senderId, name }) => {
      try {
        if (!senderId || !recipientId) {
          throw new Error("Sender ID or recipient ID is missing");
        }

        // Emit the message to the recipient
        const recipientSocketId = userSocketMap[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("recive", {
            message: msg,
            senderId,
            recipientId,
            name,
            timestamp: Date.now()
          });
          console.log("map", userSocketMap);
        } else {
          console.log("Recipient socket not found for user ID:", recipientId);
        }

        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("recive", {
            message: msg,
            senderId,
            recipientId,
            name,
            timestamp: Date.now()
          });
          console.log("map", userSocketMap);
        } else {
          console.log("Sender socket not found for user ID:", senderId);
        }

        // Save the message to the database
        if (!senderId) {
          throw new Error("Sender ID is missing or invalid");
        }

        await saveMessageToDatabase(senderId, recipientId, msg);
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    // Add the socket ID to the userSocketMap when a user connects
    socket.on("userId", userId => {
      userSocketMap[userId] = socket.id;
    });

    console.log("socket me", socket.id);
    socket.emit("me", socket.id);

    socket.on("sendIds", ({ senderId, recipientId, senderName }) => {
      if (!senderId || !recipientId) {
        throw new Error("Sender ID or recipient ID is missing");
      }

      const senderSocketId = userSocketMap[senderId];
      const recipientSocketId = userSocketMap[recipientId];

      if (senderSocketId && recipientSocketId) {
        socket.to(recipientSocketId).emit("recieveIds", {
          senderName: senderName,
          senderSocketId: senderSocketId,
          senderId: senderId
        });
      } else {
        console.log("Sender and reciever socket not found for user ID");
      }
    });

    socket.on("disconnected", () => {
      socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", data => {
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      });
    });

    socket.on("answerCall", data => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    // Remove the socket ID from the userSocketMap when a user disconnects
    socket.on("disconnect", () => {
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};
