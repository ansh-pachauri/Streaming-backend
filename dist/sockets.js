"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const ws_1 = require("ws");
exports.wss = new ws_1.WebSocketServer({ port: 8080 });
// Define the rooms type
const rooms = {};
//broadcasting the messages to all the clients in the room
const broadcast = (roomId, message) => {
    if (rooms[roomId]) {
        rooms[roomId].clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
};
//initializing the room if doesnot exist
const initializeRoom = (roomId) => {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            clients: new Set(),
            strokes: [],
            slides: [],
            chatEnabled: true
        };
    }
};
//message handling
const handleMessage = (socket, data) => {
    const { type, sessionId, payload } = data;
    switch (type) {
        case "SUBSCRIBE_ADMIN":
        case "SUBSCRIBE":
            const roomId = payload;
            initializeRoom(roomId);
            rooms[roomId].clients.add(socket);
            broadcast(roomId, JSON.stringify({ type: "JOINED_ROOM", payload: rooms[roomId] }));
            break;
        case "STROKE":
            rooms[sessionId].strokes.push(payload);
            broadcast(sessionId, JSON.stringify({ type: "STROKE", payload: rooms[sessionId].strokes }));
            break;
        case "CHAT_MESSAGE":
            const room = rooms[sessionId];
            if (room.chatEnabled) {
                broadcast(sessionId, JSON.stringify({ type: "CHAT_MESSAGE", payload: payload }));
            }
            else {
                socket.send(JSON.stringify({ type: "CHAT_MESSAGE_DISABLED" }));
            }
            break;
        case "CHAT_ENABLED":
            const { enabled } = payload;
            rooms[sessionId].chatEnabled = enabled;
            broadcast(sessionId, JSON.stringify({ type: "CHAT_ENABLED", payload: { enabled } }));
            break;
        case "SLIDES_CHANGED":
            const slidePayload = payload;
            rooms[sessionId].slides = slidePayload;
            broadcast(sessionId, JSON.stringify({ type: "SLIDES_CHANGED", payload: slidePayload }));
            break;
        default:
            socket.send(JSON.stringify({ type: "UNKNOWN_MESSAGE" }));
    }
};
exports.wss.on("connection", (ws) => {
    console.log("New connection");
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            handleMessage(ws, data);
        }
        catch (error) {
            console.error("Invalid JSON:", error.message);
        }
    });
    ws.on("close", () => {
        console.log("Connection closed");
        for (const roomId in rooms) {
            rooms[roomId].clients.delete(ws);
        }
    });
});
