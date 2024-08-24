require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const route = require("./features/route");
const app = express();
const {
  addUser,
  findUser,
  getRoomUsers,
  removeUser,
} = require("./features/users");

const {GoogleGenerativeAI} = require("@google/generative-ai");

const allowedOrigins = ["https://comm-net.vercel.app"]; // Replace with your actual Vercel frontend URL
// const allowedOrigins = ["http://localhost:3000"]; // Replace with your actual Vercel frontend URL

app.use(cors());
app.use(route);
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const genAI = new GoogleGenerativeAI(`${process.env.API_KEY}`);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user, isExist } = addUser({ name, room });

    const userMessage = isExist
      ? `${user.name}, Welcome back.`
      : `${user.name}, Successfully added in the chat room. Here you will see all the real-time messages from all members present in the room. Start message with / to get AI generate response.`;

    socket.emit("message", {
      data: { user: { name: "Admin" }, message: userMessage },
    });

    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Admin" }, message: `${user.name} has joined` },
    });

    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });
  });

  socket.on("sendMessage", async ({ message, params }) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
      if(message.startsWith("/")){
        try{
          const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
          const result = await model.generateContent(message.substring(1));
          const response = await result.response;
          const aiMessage = await response.text();

          io.to(user.room).emit("message", {
            data: {user: {name: "AIBOT"}, message: aiMessage},
          });
        }catch(error){
          console.log(error);
          io.to(user.room).emit("message", {
            data: {user: {name: "Admin"}, message: "Error generating AI response."},
          });
        }
      }
    }
  });

  socket.on("leftRoom", ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `${name} has left` },
      });

      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  io.on("disconnect", () => {
    console.log("Disconnect");
  });
});

const port = process.env.port | 5000;

server.listen(port, () => {
  console.log("Server is running");
});
