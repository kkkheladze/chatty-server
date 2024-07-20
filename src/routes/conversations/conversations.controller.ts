import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { User } from 'src/core/decorators/user.decorator';
import { ConversationsService } from './conversations.service';
import { ConversationDTO } from './schemas/conversation';
import { MessageDTO } from './schemas/message';

@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  async createConversation(@Body() conversationsDTO: ConversationDTO) {
    return this.conversationsService.createConversation(conversationsDTO);
  }

  @Get()
  async getAllConversations(
    @Query('populate', new ParseBoolPipe({ optional: true })) populate: boolean = false,
    @User('_id') userId: string,
  ) {
    return this.conversationsService.getAllConversations(userId, populate);
  }

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ) {
    return this.conversationsService.getMessages(conversationId, limit, offset);
  }

  @Post(':conversationId/messages')
  async sendMessage(@Param('conversationId') conversationId: string, @Body() message: MessageDTO) {
    return this.conversationsService.sendMessage(conversationId, message);
  }
}
