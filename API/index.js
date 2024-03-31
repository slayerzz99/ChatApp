require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
const connectDB = require("./DBconnect");
const allApiRoutes = require("./routes/allApiRoutes.routes");
const socketHandler = require("./socket/socketHandler");

const port = process.env.PORT || 8000;

app.use(express.json({ limit: "10000kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*"
  })
);

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "build")));

socketHandler(io);

app.use("/api", allApiRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

connectDB()
  .then(() => {
    httpServer.listen(port, (req, res) => {
      console.log("listening on port", port);
    });
  })
  .catch(err => {
    console.log("error in server listening on port", err);
  });