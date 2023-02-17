import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorityInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const { headers } = context.switchToHttp().getRequest();
    // const apiKey = headers['x-api-key'] ?? '';
    // const apiKeys = (this.configService.get('authentication.apiKeys') ??
    //   []) as string[];

    // // X-API-KEY
    // // console.log(apiKeys);
    // if (!apiKeys.includes(apiKey))
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.UNAUTHORIZED,
    //       message: 'Please put X-API-KEY in the header.',
    //     },
    //     HttpStatus.UNAUTHORIZED,
    //   );
    return next.handle();
  }
}
