import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { UserDTO, UserDocument } from '../users/schemas/user';
import { UsersService } from '../users/users.service';

export type Credentials = { email: string; password: string };
export type TokenContent = { _id: string; email: string; name: string; lastName: string; exp: number; iat: number };

@Injectable()
export class AuthService {
  readonly ACCESS_TOKEN_COOKIE = 'access-token';
  readonly REFRESH_TOKEN_COOKIE = 'refresh-token';
  readonly ACCESS_TOKEN_AGE = 30 * 60 * 1000; // 30 minutes
  readonly REFRESH_TOKEN_AGE = 7 * 24 * 60 * 60 * 1000; // 1 week

  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async login(credentials: Credentials) {
    if (!(credentials.email && credentials.password))
      throw new BadRequestException('Email and password must be provided');

    const user = await this.usersService.getByProps({ email: credentials.email });
    if (!user) throw new NotFoundException('User not found');

    const passwordsMatch: boolean = await bcrypt.compare(credentials.password, user.password);
    if (!passwordsMatch) throw new NotFoundException('User not found');

    const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  }

  async register(newUser: UserDTO) {
    if (!newUser.email || !newUser.password) throw new BadRequestException('Email and password must be provided');

    try {
      const encryptedPassword = await bcrypt.hash(newUser.password, 10);
      const user = await this.usersService.add({
        ...newUser,
        email: newUser.email,
        password: encryptedPassword,
      });

      const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);

      user.refreshToken = refreshToken;
      await user.save();
      return { accessToken, refreshToken };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async refreshToken(token: string) {
    const user = await this.usersService.getByProps({ refreshToken: token });

    try {
      const decoded: TokenContent = await this.jwt.verifyAsync(token, { secret: process.env.REFRESH_TOKEN_SECRET });
      if (!user) {
        // Token reused
        const hackedUser = await this.usersService.getById(decoded._id);
        if (hackedUser) {
          hackedUser.refreshToken = null;
          await hackedUser.save();
        }
        throw new ForbiddenException();
      } else {
        // Refresh token still valid
        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);
        user.refreshToken = refreshToken;
        await user.save();
        return { accessToken, refreshToken };
      }
    } catch {
      user.refreshToken = null;
      await user.save();
      throw new ForbiddenException();
    }
  }

  async logout(userId: string) {
    const user = await this.usersService.getById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.refreshToken = null;
    await user.save();
  }

  async generateAccessAndRefreshTokenPair({ name, lastName, email, _id }: UserDocument) {
    const userInfo = {
      _id,
      email,
      name,
      lastName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(userInfo, {
        expiresIn: '30m',
        secret: process.env.ACCESS_TOKEN_SECRET,
      }),
      this.jwt.signAsync(userInfo, {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  saveTokensInCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie(this.ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.ACCESS_TOKEN_AGE,
    });
    response.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.REFRESH_TOKEN_AGE,
    });
  }

  getTokensFromCookies(request: Request) {
    return {
      accessToken: request.cookies[this.ACCESS_TOKEN_COOKIE],
      refreshToken: request.cookies[this.REFRESH_TOKEN_COOKIE],
    };
  }

  removeTokensFromCookies(response: Response) {
    response.clearCookie(this.ACCESS_TOKEN_COOKIE, { httpOnly: true, secure: true });
    response.clearCookie(this.REFRESH_TOKEN_COOKIE, { httpOnly: true, secure: true });
  }
}
