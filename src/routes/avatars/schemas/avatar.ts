import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/routes/users/schemas/user';

export type AvatarDocument = HydratedDocument<Avatar>;

@Schema()
export class Avatar {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true }) userId: Types.ObjectId[];
  @Prop({ required: true }) image: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
