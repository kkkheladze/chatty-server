import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../core/schemas/user';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  get(prop: Partial<User>): Promise<UserDocument> {
    return this.userModel.findOne(prop).exec();
  }

  add(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  getAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
