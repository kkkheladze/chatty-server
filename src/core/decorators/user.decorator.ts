import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenContent } from 'src/auth/auth.service';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): TokenContent => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
