import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/core/decorators/user.decorator';
import { AvatarsService } from './avatars.service';
import { Response } from 'express';

@Controller('avatars')
export class AvatarsController {
  constructor(private avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @User('_id') userId: string) {
    await this.avatarsService.uploadAvatar(userId, file.buffer);
  }

  @Get()
  async getAvatar(@User('_id') userId: string, @Query('id') id: string, @Res() response: Response) {
    const buffer = await this.avatarsService.getAvatar(id || userId);
    if (!buffer) throw new NotFoundException('Avatar not found');
    response.setHeader('Content-Type', 'application/octet-stream');
    response.send(buffer);
  }

  @Delete()
  deleteAvatar(@User('_id') userId: string) {
    return this.avatarsService.deleteAvatar(userId);
  }
}
