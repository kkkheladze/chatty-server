import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongoSchema } from 'mongoose';
import { Message } from './message';
import { User } from 'src/routes/users/schemas/user';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ versionKey: false })
export class Conversation {
  @Prop({ type: [{ type: MongoSchema.Types.ObjectId, ref: User.name, required: true }] }) users: User[];
  @Prop({ type: MongoSchema.Types.ObjectId, ref: Message.name }) lastMessage: Message;
  @Prop({ default: Date.now }) updatedAt: Date;
}

export class ConversationDTO {
  users: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
