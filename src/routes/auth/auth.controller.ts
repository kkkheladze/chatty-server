import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/decorators/public.decorator';
import { AuthService, Credentials } from './auth.service';
import { UserDTO } from '../users/schemas/user';

@Controller('auth')
export class AuthController {
  maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week

  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() credentials: Credentials, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(credentials);
    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.maxAge,
    });
    response.send(accessToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() newUser: UserDTO, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.register(newUser);
    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.maxAge,
    });
    response.send(accessToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const token = request.cookies['refresh-token'];
    if (!token) throw new ForbiddenException('No token provided');
    response.clearCookie('refresh-token', { httpOnly: true, secure: true });

    const { accessToken, refreshToken } = await this.authService.refreshToken(token);
    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.maxAge,
    });
    response.send(accessToken);
  }
}
