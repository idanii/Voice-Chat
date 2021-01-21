const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", function (req, res) {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", function (socket) {
  socket.on("join-room", function (data) {
    socket.join(data.roomId);
    socket
      .to(data.roomId)
      .broadcast.emit("user-connected", { userId: data.userId });

    socket.on("disconnect", function () {
      socket
        .to(data.roomId)
        .broadcast.emit("user-disconnected", { userId: data.userId });
    });
  });
});

server.listen(3000);
