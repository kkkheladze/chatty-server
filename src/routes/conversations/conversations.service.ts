import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDTO } from './schemas/conversation';
import { Message, MessageDTO } from './schemas/message';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private usersService: UsersService,
  ) {}

  async createConversation(conversationDTO: ConversationDTO) {
    try {
      const { users } = conversationDTO;
      if (users.length !== 2) throw new ConflictException('Conversation can only be created between two users');

      const [user1, user2] = await Promise.all(users.map((userId) => this.usersService.getById(userId)));
      if (!user1 || !user2) throw new NotFoundException('One or more users not found');
      if (user1._id === user2._id) throw new ConflictException('Cannot create conversation with yourself');

      const existingConversation = await this.conversationModel.findOne({
        users: {
          $all: users,
        },
      });
      if (existingConversation) throw new ConflictException('Conversation already exists');

      const conversation = await new this.conversationModel({ users: users }).save();
      return this.conversationModel.findById(conversation._id, undefined, { populate: 'users' }).exec();
    } catch (e) {
      if (e instanceof ConflictException || e instanceof NotFoundException) throw e;
      else {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async getAllConversations(userId: string, populate: boolean) {
    return this.conversationModel
      .find({ users: userId }, undefined, { populate: populate && 'users', sort: { updatedAt: -1 } })
      .exec();
  }

  async getMessages(conversationId: string, limit: number, offset: number) {
    const conversationExists = await this.conversationModel.exists({ _id: conversationId });

    if (!conversationExists) throw new NotFoundException(`Conversation with ID ${conversationId} not found`);

    return this.messageModel.find({ conversationId }).sort({ sentAt: -1 }).skip(offset).limit(limit).exec();
  }

  async sendMessage(messageToSend: MessageDTO) {
    const { conversationId, senderId, text } = messageToSend;

    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const newMessage = new this.messageModel({
      conversationId,
      senderId,
      text,
    });

    const message = await newMessage.save();
    conversation.set({
      lastMessage: message._id,
      updatedAt: message.sentAt,
    });
    await conversation.save();

    return message;
  }
}
