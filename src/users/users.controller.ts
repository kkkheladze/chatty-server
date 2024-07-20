import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getUserByQuery(@Query('search') search: string = '') {
    return this.usersService.getByQuery(search);
  }
}
