import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/decorators/public.decorator';
import { User } from 'src/core/decorators/user.decorator';
import { UserDTO } from '../users/schemas/user';
import { AuthService, Credentials } from './auth.service';

@Controller('auth')
export class AuthController {
  readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 1 week
  readonly ACCESS_TOKEN_COOKIE = 'access-token';
  readonly REFRESH_TOKEN_COOKIE = 'refresh-token';

  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() credentials: Credentials, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(credentials);
    this.respondWithToken(response, accessToken, refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() newUser: UserDTO, @Res() response: Response) {
    const { accessToken, refreshToken } = await this.authService.register(newUser);
    this.respondWithToken(response, accessToken, refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const token = request.cookies['refresh-token'];
    if (!token) throw new ForbiddenException('No token provided');
    response.clearCookie('refresh-token', { httpOnly: true, secure: true });

    const { accessToken, refreshToken } = await this.authService.refreshToken(token);
    this.respondWithToken(response, accessToken, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@User('_id') userId: string, @Res() response: Response) {
    await this.authService.logout(userId);
    response.clearCookie(this.ACCESS_TOKEN_COOKIE);
    response.clearCookie(this.REFRESH_TOKEN_COOKIE);
    response.send();
  }

  private respondWithToken(response: Response, accessToken: string, refreshToken: string) {
    response.cookie(this.ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.MAX_AGE,
    });
    response.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.MAX_AGE,
    });
    response.send();
  }
}
