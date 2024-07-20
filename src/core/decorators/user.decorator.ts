import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenContent } from 'src/routes/auth/auth.service';

export const User = createParamDecorator((property: string, ctx: ExecutionContext): TokenContent => {
  const request = ctx.switchToHttp().getRequest();
  return property ? request.user[property] : request.user;
});
