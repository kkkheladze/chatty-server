import { Injectable } from '@nestjs/common';
import { Avatar } from './schemas/avatar';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AvatarsService {
  constructor(@InjectModel('Avatar') private avatarModel: Model<Avatar>) {}

  async uploadAvatar(userId: string, buffer: Buffer) {
    const existingAvatar = await this.avatarModel.findOne({ userId });
    const base64 = buffer.toString('base64');
    if (existingAvatar) {
      existingAvatar.image = base64;
      return existingAvatar.save();
    }
    return new this.avatarModel({ userId, image: base64 }).save();
  }

  async getAvatar(userId: string) {
    const avatar = await this.avatarModel.findOne({ userId });
    if (!avatar) return null;
    return Buffer.from(avatar.image, 'base64');
  }

  deleteAvatar(userId: string) {
    return this.avatarModel.deleteOne({ userId });
  }
}
