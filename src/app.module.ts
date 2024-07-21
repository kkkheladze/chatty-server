import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './routes/auth/auth.module';
import { AvatarsModule } from './routes/avatars/avatars.module';
import { AuthGuard } from './core/guards/auth.guard';
import { UsersModule } from './routes/users/users.module';
import { ChatModule } from './routes/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: 'chatty' }),
    AuthModule,
    UsersModule,
    ChatModule,
    AvatarsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
