import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDTO } from './schemas/chat';
import { Message, MessageDTO } from './schemas/message';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private usersService: UsersService,
  ) {}

  async createChat(chatDTO: ChatDTO) {
    try {
      const { users } = chatDTO;
      if (users.length !== 2) throw new ConflictException('Chat can only be created between two users');

      const [user1, user2] = await Promise.all(users.map((userId) => this.usersService.getById(userId)));
      if (!user1 || !user2) throw new NotFoundException('One or more users not found');
      if (user1._id === user2._id) throw new ConflictException('Cannot create chat with yourself');

      const existingChat = await this.chatModel.findOne({
        users: {
          $all: users,
        },
      });
      if (existingChat) throw new ConflictException('Chat already exists');

      const chat = await new this.chatModel({ users: users }).save();
      return this.chatModel.findById(chat._id, undefined, { populate: 'users' }).exec();
    } catch (e) {
      if (e instanceof ConflictException || e instanceof NotFoundException) throw e;
      else {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async getChatsByUser(userId: string, populate: boolean) {
    return this.chatModel
      .find({ users: userId }, undefined, { populate: populate && ['users', 'lastMessage'], sort: { updatedAt: -1 } })
      .exec();
  }

  async getMessages(chatId: string, limit: number, offset: number) {
    const chatExists = await this.chatModel.exists({ _id: chatId });

    if (!chatExists) throw new NotFoundException(`Chat with ID ${chatId} not found`);

    return this.messageModel.find({ chatId }).sort({ sentAt: -1 }).skip(offset).limit(limit).exec();
  }

  async sendMessage(chatId: string, messageToSend: MessageDTO) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    const newMessage = new this.messageModel({
      chatId,
      ...messageToSend,
    });

    const message = await newMessage.save();
    chat.set({
      lastMessage: message._id,
      updatedAt: message.sentAt,
    });
    await chat.save();

    return message;
  }
}
