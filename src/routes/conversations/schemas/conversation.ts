import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Message } from './message';
import { User } from 'src/routes/users/schemas/user';

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
