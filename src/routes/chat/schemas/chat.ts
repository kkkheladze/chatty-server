import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';
import { User } from 'src/routes/users/schemas/user';
import { Message } from './message';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ versionKey: false })
export class Chat {
  @Prop({ type: [{ type: MongoSchema.Types.ObjectId, ref: 'User', required: true }] }) users: User[];
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Message' }) lastMessage: Message;
  @Prop({ default: Date.now }) updatedAt: Date;
}

export class ChatDTO {
  users: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
