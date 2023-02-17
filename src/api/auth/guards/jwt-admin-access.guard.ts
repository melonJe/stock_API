import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { handleRequest } from './common';

@Injectable()
export class JwtAdminAccessGuard extends AuthGuard('jwt-admin-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest = handleRequest;
}
