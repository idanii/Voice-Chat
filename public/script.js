const socket = io("/");
const videoGrid = document.getElementById("video-grid");

const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: false,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", function (call) {
      call.answer(stream);

      const video = document.createElement("video");

      call.on("stream", function (userVideoStream) {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", function (data) {
      connectToNewUser(data.userId, stream);
    });
  });

socket.on("user-disconnected", function (data) {
  if (peers[data.userId]) peers[data.userId].close();
  if (document.getElementById(data.userId))
    document.getElementById(data.userId).remove();
});

myPeer.on("open", function (id) {
  socket.emit("join-room", { roomId: ROOM_ID, userId: id });
});

socket.on("user-connected", function (data) {
  createUser(data.userId);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", function () {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", function (userVideoStream) {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", function () {
    video.remove();
  });

  peers[userId] = call;
}

function createUser(id) {
  const users = document.getElementById("users-in-room");
  const user = document.createElement("div");
  user.setAttribute("class", "user");
  user.setAttribute("id", id);
  users.appendChild(user);
}

function deleteUser(id) {
  document.getElementById(id).remove();
}
