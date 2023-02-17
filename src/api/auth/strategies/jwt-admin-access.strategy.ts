import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthTokenPayload, IAdminClaim } from '@common/interfaces';
import { CLAIM_TYPE, ERROR_CODE, TOKEN_TYPE } from '@common/enums';
import { jwtFromRequest } from './common';

@Injectable()
export class JwtAdminAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-admin-access',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  validate(
    payload: IAuthTokenPayload<IAdminClaim>,
  ): IAuthTokenPayload<IAdminClaim> {
    if (
      payload.type !== TOKEN_TYPE.ACCESS ||
      payload.claims.type !== CLAIM_TYPE.ADMIN
    )
      throw new HttpException(
        {
          statusCode: ERROR_CODE.ONLY_ALLOWED_ADMIN_ACCESS_TOKEN,
          message: 'Only admin access tokens are allowed',
        },
        HttpStatus.BAD_REQUEST,
      );
    // 페이로드에 iss가 존재하면, iss 발급처랑 일치하는지 확인
    if (
      payload.iss &&
      payload.iss !== this.configService.get('server.domain')
    ) {
      throw new HttpException(
        {
          statusCode: ERROR_CODE.MISMATCHED_JWT_TOKEN_ISSUER,
          message: 'Token issuer is different.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return payload;
  }
}
