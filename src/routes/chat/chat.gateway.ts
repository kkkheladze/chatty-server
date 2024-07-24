import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from './schemas/message';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients: Set<Socket> = new Set();

  afterInit(server) {}

  handleConnection(client: Socket) {
    this.clients.add(client);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
  }

  sendMessage(message: string, payload: Message) {
    this.server.emit(message, payload);
    this.server.to('kutu');
  }
}
