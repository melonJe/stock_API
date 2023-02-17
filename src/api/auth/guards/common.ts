import { ERROR_CODE } from '@common/enums';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const handleRequest = (err: any, user: any, info: any) => {
  const error = err ?? info;
  if (error || !user) {
    if (error)
      if (error instanceof TokenExpiredError) {
        throw new HttpException(
          {
            statusCode: ERROR_CODE.EXPIRED_JWT_TOKEN,
            message: 'Token Expired',
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new HttpException(
          {
            statusCode: ERROR_CODE.INVALID_JWT_TOKEN,
            message: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

    throw (
      error ??
      new HttpException(
        {
          statusCode: ERROR_CODE.NOT_FOUND_USER,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      )
    );
  }
  return user;
};
