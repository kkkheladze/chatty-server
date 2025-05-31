import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/decorators/public.decorator';
import { User } from 'src/core/decorators/user.decorator';
import { UserDTO } from '../users/schemas/user';
import { AuthService, Credentials } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() credentials: Credentials, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(credentials);
    this.authService.saveTokensInCookies(response, accessToken, refreshToken);
    response.send();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() newUser: UserDTO, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.register(newUser);
    this.authService.saveTokensInCookies(response, accessToken, refreshToken);
    response.send();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const token = request.cookies['refresh-token'];
    if (!token) throw new ForbiddenException('No token provided');
    response.clearCookie('refresh-token', { httpOnly: true, secure: true });

    const { accessToken, refreshToken } = await this.authService.refreshToken(token);
    this.authService.saveTokensInCookies(response, accessToken, refreshToken);
    response.send();
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@User('_id') userId: string, @Res() response: Response) {
    await this.authService.logout(userId);
    this.authService.removeTokensFromCookies(response);
    response.send();
  }
}
