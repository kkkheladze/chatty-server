import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';
import { Avatar, AvatarSchema } from './schemas/avatar';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Avatar', schema: AvatarSchema }])],
  controllers: [AvatarsController],
  providers: [AvatarsService],
})
export class AvatarsModule {}
