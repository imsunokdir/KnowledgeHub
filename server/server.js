const express = require("express");
const cors = require("cors");
const connectDb = require("./congif/db");
const authRouter = require("./routes/auth.route");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const docRouter = require("./routes/document.route");
const { Server } = require("socket.io");
const http = require("http");
const searchRouter = require("./routes/search.route");
const qaRouter = require("./routes/qa.route");
const userRouter = require("./routes/user.route");

const app = express();

// CORS setup - make it more explicit
const corsOptions = {
  origin: process.env.FRONTEND,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));

// Make sure this comes after CORS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/auth", authRouter);
app.use("/document", docRouter);
app.use("/search", searchRouter);
app.use("/qa", qaRouter);
app.use("/user", userRouter);

// create http server
const server = http.createServer(app);

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// attach io to app for later usage
app.set("io", io);

// socket event listeners
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // listen for document join
  socket.on("joinDocument", (docId) => {
    socket.join(docId); // join room based on document id
    console.log(`Socket ${socket.id} joined document room: ${docId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start server
server.listen(process.env.PORT, async () => {
  await connectDb();
  console.log(`Server has started on port: ${process.env.PORT}`);
});
