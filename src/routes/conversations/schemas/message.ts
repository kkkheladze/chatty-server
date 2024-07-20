import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';
import { User } from 'src/routes/users/schemas/user';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ versionKey: false })
export class Message {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: MongoSchema.Types.ObjectId;
  @Prop({ type: MongoSchema.Types.ObjectId, ref: User.name, required: true }) senderId: MongoSchema.Types.ObjectId;
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
