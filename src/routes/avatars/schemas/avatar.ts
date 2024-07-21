import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';
import { User } from 'src/routes/users/schemas/user';

export type AvatarDocument = HydratedDocument<Avatar>;

@Schema({ versionKey: false })
export class Avatar {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: MongoSchema.Types.ObjectId;
  @Prop({ required: true }) image: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
