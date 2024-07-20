import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, lowercase: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) lastName: string;
  @Prop() refreshToken: string;
  @Prop() avatar: string;
}

export class UserDTO {
  email: string;
  password: string;
  name: string;
  lastName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
