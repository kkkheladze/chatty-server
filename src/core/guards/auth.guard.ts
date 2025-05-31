import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/routes/auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const http = context.switchToHttp();
    const request = http.getRequest();
    const { accessToken, refreshToken } = this.authService.getTokensFromCookies(request);
    if (!accessToken) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, { secret: process.env.ACCESS_TOKEN_SECRET });
      request['user'] = payload;
    } catch {
      const response = http.getResponse();
      try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await this.authService.refreshToken(refreshToken);
        this.authService.saveTokensInCookies(response, newAccessToken, newRefreshToken);
      } catch {
        this.authService.removeTokensFromCookies(response);
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
