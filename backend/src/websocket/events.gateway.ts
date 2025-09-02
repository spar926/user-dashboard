// Purpose: Socket.IO gateway to broadcast real-time events
// - Sends `userCreated` and `emailStatus` to connected clients.
// - Keep broadcasting details here; let services decide WHEN to emit.
//
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { Logger } from '@nestjs/common'

@WebSocketGateway({
    // CORS here affects the Socket.IO handshake (HTTP) and WS upgrade.
    // Use env to avoid hardcoding and to match your Vite origin exactly.
    cors: { 
        origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
        methods: ['GET', 'POST'],
        // Only set credentials: true if you actually send cookies/headers
        // that require credentials. Otherwise you can omit this.
        credentials: true
    }
})
 
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect{
    private logger = new Logger('EventsGateway'); // nestjs logger

    @WebSocketServer() 
    server: Server;

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // server -> client (broadcast)
    emitUserCreated(user: any) {
        this.logger.log(`Emitting userCreated event: ${JSON.stringify(user)}`);
        this.server.emit('userCreated', user) // broadcasts to all connected clients
    }

    // server -> client (room)
    emitEmailStatus(status: string, userEmail: string) {
        this.logger.log(`Emitting emailStatus event ${status} for ${userEmail}`);
        this.server.emit('emailStatus', {
            status, 
            userEmail,
            timestamp: new Date()
        });
    }
}
