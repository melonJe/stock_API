import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { handleRequest } from './common';

@Injectable()
export class JwtGatewayRefreshGuard extends AuthGuard('jwt-gateway-refresh') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest = handleRequest;
}
