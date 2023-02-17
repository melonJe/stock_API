import type { Algorithm } from 'jsonwebtoken';
import moment from 'moment';
import { v4 } from 'uuid';
import type {
  IAdminClaim,
  IAuthTokenPayload,
  IClaim,
  IGatewayClaim,
  ITokenWithExp,
} from '@common/interfaces';
import type { JwtVerifyOptions } from '@nestjs/jwt';
import { IAdmin } from '@common/interfaces';
import { CLAIM_TYPE, TOKEN_TYPE } from '@common/enums';
import { IGatewayInfo } from '@common/interfaces/gateway.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

export interface IJwtSignOption {
  duration?: number;
  tokenType: TOKEN_TYPE;
}

export abstract class JwtUtil {
  /*
   *
   */
  public static generate = (
    info: {
      type: CLAIM_TYPE;
      data: IAdmin | IGatewayInfo;
    },
    options: IJwtSignOption,
    sign: (payload: IAuthTokenPayload<IClaim>) => string,
  ): ITokenWithExp => {
    const { tokenType, duration } = options;

    const now = moment();
    const iat = Math.floor(now.valueOf() / 1000);
    // const exp = Math.floor(now.clone().add(10, 'seconds').valueOf() / 1000);
    const exp = Math.floor(
      now
        .clone()
        .add(duration ?? 1, 'days')
        .valueOf() / 1000,
    );

    let claims: IAdminClaim | IGatewayClaim;
    if (info.type == CLAIM_TYPE.ADMIN) {
      claims = {
        id: info.data.id,
        type: info.type,
        name: info.data.name,
        layout: (info.data as IAdmin).layoutMode,
        roles: (info.data as IAdmin).permission.split(','),
      } as IAdminClaim;
    } else if (info.type == CLAIM_TYPE.GATEWAY) {
      claims = {
        id: info.data.id,
        type: info.type,
        name: info.data.name,
      } as IGatewayClaim;
    } else {
      throw new HttpException({}, HttpStatus.BAD_REQUEST);
    }

    const payload: IAuthTokenPayload<IClaim> = {
      iat,
      exp,
      nbf: iat,
      jit: v4(),
      fresh: tokenType === TOKEN_TYPE.ACCESS,
      type: tokenType,
      version: 1,
      claims,
    };

    const token = sign(payload);
    return {
      token,
      exp,
    };
  };

  public static decode<T extends object = any>(
    token: string,
    { publicKey, audience }: JwtVerifyOptions,
    verify: (token: string, options?: JwtVerifyOptions) => T,
  ): T {
    const algorithms: Algorithm = 'RS256';

    const buffer = publicKey;
    return verify(token, {
      publicKey: buffer,
      algorithms: [algorithms],
      audience,
    });
  }
}
