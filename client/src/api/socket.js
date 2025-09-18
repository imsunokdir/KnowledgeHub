import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });
  }
  return socket;
};

export const joinDocumentRoom = (docId) => {
  const s = connectSocket();
  console.log("📌 Joining document room:", docId);

  s.emit("joinDocument", docId);
};

export const subscribeToDocumentUpdates = (callback) => {
  const s = connectSocket();
  console.log("📡 Subscribed to document updates");

  s.on("documentUpdated", (data) => {
    console.log("📩 Document update received from server:", data);
    callback(data);
  });
};
