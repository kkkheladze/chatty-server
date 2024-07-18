import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, Credentials } from './auth.service';
import { User } from 'src/core/schemas/user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() credentials: Credentials, @Res() response: Response) {
    return this.authService.login(credentials, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() user: User, @Res() response: Response) {
    return this.authService.register(user, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  refreshToken(@Req() request: Request, @Res() response: Response) {
    return this.authService.refreshToken(request, response);
  }
}
