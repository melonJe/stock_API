import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODE } from '@common/enums';

@Injectable()
export class LocalAdminGuard extends AuthGuard('local-admin') {
  handleRequest(err: any, user: any, info: any) {
    const error = err ?? info;
    if (error || !user) {
      if (error)
        if (error instanceof HttpException) {
          try {
            const { statusCode } = error.getResponse() as any;
            switch (statusCode) {
              case ERROR_CODE.INVALID_CREDENTIALS:
                throw new HttpException(
                  {
                    statusCode,
                    message: 'Incorrect password',
                  },
                  HttpStatus.FORBIDDEN,
                );
              case ERROR_CODE.NOT_FOUND_USER:
                throw new HttpException(
                  {
                    statusCode,
                    message: 'User not found',
                  },
                  HttpStatus.NOT_FOUND,
                );
              default:
                throw error;
            }
          } catch (_err) {
            throw _err;
          }
        } else {
          switch (error.message) {
            case 'Missing credentials':
              throw new HttpException(
                {
                  statusCode: ERROR_CODE.MISSING_CREDENTIALS,
                  message: 'Please enter a valid parameters.',
                },
                HttpStatus.BAD_REQUEST,
              );
            default:
              break;
          }
        }

      throw (
        error ??
        new HttpException(
          {
            statusCode: ERROR_CODE.NOT_FOUND_USER,
            message: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
