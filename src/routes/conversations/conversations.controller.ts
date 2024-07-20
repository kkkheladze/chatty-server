import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessageDTO } from './schemas/message';
import { ConversationDTO } from './schemas/conversation';
import { User } from 'src/core/decorators/user.decorator';
import { TokenContent } from 'src/routes/auth/auth.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  async createConversation(@Body() conversationsDTO: ConversationDTO) {
    return this.conversationsService.createConversation(conversationsDTO);
  }

  @Get()
  async getAllConversations(@User() user: TokenContent) {
    return this.conversationsService.getAllConversations(user._id);
  }

  @Get(':conversationId/messages')
  async getMessages(@Param('conversationId') conversationId: string, @Query('limit') limit: number = 50, @Query('offset') offset: number = 0) {
    return this.conversationsService.getMessages(conversationId, limit, offset);
  }

  @Post(':conversationId/messages')
  async sendMessage(@Body() message: MessageDTO) {
    return this.conversationsService.sendMessage(message);
  }
}
