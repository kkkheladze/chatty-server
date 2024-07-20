import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true }) conversationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true }) senderId: Types.ObjectId;
  @Prop({ required: true }) text: string;
  @Prop({ default: Date.now, required: true }) sentAt: Date;
  @Prop({ default: 'sent', enum: ['sent', 'read'] }) status: 'sent' | 'read';
}

export class MessageDTO {
  conversationId: string;
  senderId: string;
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
