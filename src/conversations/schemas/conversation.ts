import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user';
import { Message } from './message';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: [{ type: Types.ObjectId, ref: User.name }] }) users: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: Message.name }) lastMessage: Types.ObjectId;
  @Prop({ default: Date.now }) updatedAt: Date;
}

export class ConversationDTO {
  users: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
