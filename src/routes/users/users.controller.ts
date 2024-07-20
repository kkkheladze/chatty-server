import { Controller, Get, HttpCode, HttpStatus, ParseBoolPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/core/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getUserByQuery(
    @User('_id') userId: string,
    @Query('search') search: string = '',
    @Query('excludeSelf', new ParseBoolPipe({ optional: true })) excludeSelf: boolean = true,
  ) {
    return this.usersService.getByQuery(search, excludeSelf, userId);
  }
}
