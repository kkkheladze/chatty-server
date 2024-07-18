import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { User } from 'src/core/schemas/user';
import { UsersService } from 'src/users/users.service';

export type Credentials = { email: string; password: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async login(credentials: Credentials, response: Response) {
    if (!(credentials.email && credentials.password)) throw new BadRequestException('Email and password must be provided');

    const user = await this.usersService.get({ email: credentials.email });
    if (!user) throw new NotFoundException('User not found');

    const passwordsMatch: boolean = await bcrypt.compare(credentials.password, user.password);

    if (!passwordsMatch) throw new NotFoundException('User not found');

    const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);

    user.refreshToken = refreshToken;

    await user.save();

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    response.send(accessToken);
  }

  async register(newUser: User, response: Response) {
    if (!newUser.email || !newUser.password) throw new BadRequestException('Email and password must be provided');

    try {
      const encryptedPassword = await bcrypt.hash(newUser.password, 10);
      const user = await this.usersService.add({
        ...newUser,
        email: newUser.email.toLowerCase(),
        password: encryptedPassword,
      });

      const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);

      user.refreshToken = refreshToken;
      await user.save();

      response.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      response.send(accessToken);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async refreshToken(request: Request, response: Response) {
    const token = request.cookies['refresh-token'];
    if (!token) throw new UnauthorizedException('No token provided');

    response.clearCookie('refresh-token', { httpOnly: true, secure: true });
    const user = await this.usersService.get({ refreshToken: token });

    try {
      const decoded = await this.jwt.verifyAsync(token, { secret: process.env.REFRESH_TOKEN_SECRET });
      if (!user) {
        // Token reused
        const hackedUser = await this.usersService.get({ email: decoded.userInfo.email });
        if (hackedUser) {
          hackedUser.refreshToken = null;
          await hackedUser.save();
        }
        throw new ForbiddenException();
      } else {
        // Refresh token still valid
        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokenPair(user);

        // Saving refreshToken with current user
        user.refreshToken = refreshToken;
        await user.save();

        // Creates Secure Cookie with refresh token
        response.cookie('refresh-token', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000, // 24H
        });
        response.send(accessToken);
      }
    } catch {
      if (!user) throw new ForbiddenException();
      user.refreshToken = null;
      await user.save();
    }
  }

  private async generateAccessAndRefreshTokenPair({ name, lastName, email }: User) {
    const userInfo = {
      email,
      name,
      lastName,
    };

    const accessToken: string = await this.jwt.signAsync(userInfo, {
      expiresIn: '5m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    const refreshToken: string = await this.jwt.signAsync(
      { userInfo },
      {
        expiresIn: '1d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );
    return { accessToken, refreshToken };
  }
}
