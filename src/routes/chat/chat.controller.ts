import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { User } from 'src/core/decorators/user.decorator';
import { ChatService } from './chat.service';
import { ChatDTO } from './schemas/chat';
import { MessageDTO } from './schemas/message';

@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createChat(@Body() chatDTO: ChatDTO) {
    return this.chatService.createChat(chatDTO);
  }

  @Get()
  async getChatsByUser(
    @Query('populate', new ParseBoolPipe({ optional: true })) populate: boolean = false,
    @User('_id') userId: string,
  ) {
    return this.chatService.getChatsByUser(userId, populate);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ) {
    return this.chatService.getMessages(chatId, limit, offset);
  }

  @Post(':chatId/messages')
  async sendMessage(@Param('chatId') chatId: string, @Body() message: MessageDTO) {
    return this.chatService.sendMessage(chatId, message);
  }
}
