"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ws = void 0;
const ws_1 = require("ws");
exports.ws = new ws_1.WebSocketServer({ port: 8080 });
const SocketSessions = [];
exports.ws.on("connection", (socket) => {
    socket.on("message", (message) => {
        const data = JSON.parse(message.toString());
        const { sessionId, slide } = data;
        const session = SocketSessions.find((session) => session.sessionId === sessionId);
        if (session) {
            session.slides.push(slide);
        }
        else {
            SocketSessions.push({ sessionId, slides: [], socket });
        }
        exports.ws.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(SocketSessions));
            }
        });
        socket.send(JSON.stringify(SocketSessions));
    });
});
