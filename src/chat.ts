import { WebSocket, WebSocketServer } from "ws";
// import express, { Request, Response } from "express";
// import cors from "cors";

// const app = express();
// app.use(express.json());
// app.use(cors());



// const server = app.listen(3001, () => {
//     console.log(`Server started at port 3001`);
// });

export const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("message", (msg) => {
        try {
            const textMessage = msg.toString();
            console.log(textMessage);

            const parseMessage = JSON.parse(textMessage);

            // Broadcast to all clients
            wss.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parseMessage));
                }
            });
        } catch (err) {
            console.error("Invalid JSON message received:", msg.toString());
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ error: "Invalid JSON format" }));
            }
        }
    });

    socket.on("close", () => {
        console.log("Client disconnected");
    });
});

console.log("Server and WebSocket running on port 3000");
