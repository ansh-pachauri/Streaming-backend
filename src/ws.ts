import { WebSocketServer, WebSocket } from "ws";

export const ws = new WebSocketServer({port:8080});

interface Session{
    socket:WebSocket;
    sessionId:string;
    slides:string[];
}

const SocketSessions:Session[] = [];

ws.on("connection",(socket)=>{
    socket.on("message",(message)=>{
        const data = JSON.parse(message.toString());
        const {sessionId,slide} = data;
        const session = SocketSessions.find((session)=>session.sessionId === sessionId);
        if(session){
            session.slides.push(slide);
        }
        else{
            SocketSessions.push({sessionId,slides:[],socket});
        }
        ws.clients.forEach((client)=>{
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(SocketSessions));
            }
        })
        socket.send(JSON.stringify(SocketSessions));

    })
})
