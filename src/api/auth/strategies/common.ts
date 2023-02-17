import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODE } from '@common/enums';

export const jwtFromRequest = (req: any) => {
  let token = null;
  if (req) {
    // headers.authorization안의 Bearer 토큰 검색
    if (req.headers.authorization) {
      token = (req.headers.authorization ?? '').replace(/Bearer/g, '').trim();
    }
    // cookie안의 accessToken 검색
    else if (req.cookies) {
      if (req.cookies['accessToken']) {
        token = req.cookies['accessToken'];
      } else if (req.cookies['access_token']) {
        token = req.cookies['access_token'];
      }
    }
    // headers.cookie안의 accessToken 검색
    else if (req.headers.cookies) {
      if (req.headers.cookies['accessToken']) {
        token = req.headers.cookies['accessToken'];
      } else if (req.headers.cookies['access_token']) {
        token = req.headers.cookies['access_token'];
      }
    }
  }
  if (!token)
    throw new HttpException(
      {
        statusCode: ERROR_CODE.EMPTY_JWT_TOKEN,
        message: 'Token required',
      },
      HttpStatus.UNAUTHORIZED,
    );
  return token;
};
