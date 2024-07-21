import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserDTO } from './schemas/user';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  add(user: UserDTO): Promise<UserDocument> {
    return new this.userModel(user).save();
  }

  getByProps(prop: Partial<User>): Promise<UserDocument> {
    return this.userModel.findOne(prop).exec();
  }

  getById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  getByQuery(search: string, excludeSelf: boolean, userId: string): Promise<UserDocument[]> {
    return this.userModel
      .find(
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ],
          _id: { $ne: excludeSelf ? userId : null },
        },
        { refreshToken: 0 },
      )
      .exec();
  }

  getAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
