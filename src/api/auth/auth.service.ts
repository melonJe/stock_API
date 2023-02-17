import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { HashUtil } from '@common/utils';
import {
  IAdminClaim,
  ITokens,
  IAuthTokenPayload,
  IGatewayClaim,
  ITokenWithExp,
} from '@common/interfaces';
import { IAdmin } from '@common/interfaces';
import { CLAIM_TYPE, ERROR_CODE, TOKEN_TYPE } from '@common/enums';
import { JwtUtil } from '@common/utils/token';
import { AdminService } from '@api/admin/admin.service';
import { IGatewayInfo } from '@common/interfaces/gateway.interface';
import { Request, Response } from 'express';
import { TokenDto } from '@common/dtos/token.dto';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validate(_username: string, _password: string): Promise<IAdmin> {
    const user = await this.adminService.findOneAdminOrFail(_username);

    if (!HashUtil.validate(_password, user.password, user.salt))
      throw new HttpException(
        {
          statusCode: ERROR_CODE.INVALID_CREDENTIALS,
          message: 'Incorrect password',
        },
        HttpStatus.UNAUTHORIZED,
      );

    // switch (user.status) {
    //   case USER_STATUS.CACHE:
    //     throw new HttpException(
    //       {
    //         statusCode: ERROR_CODE.UNVERIFIED_USER,
    //         message: 'Unverified user',
    //       },
    //       HttpStatus.UNAUTHORIZED,
    //     );
    //   case USER_STATUS.INACTIVE:
    //     throw new HttpException(
    //       {
    //         statusCode: ERROR_CODE.INACTIVE_USER,
    //         message: 'Inactive user',
    //       },
    //       HttpStatus.UNAUTHORIZED,
    //     );
    //   default:
    //     break;
    // }
    if (!user.available) {
      throw new HttpException(
        {
          statusCode: ERROR_CODE.INACTIVE_USER,
          message: 'Inactive admin',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  /**
   * 어드민 토큰 재발행, 토큰 사용자를 조회하여 토큰을 생성 및 반환한다.
   * @param {IAuthTokenPayload} payload accessToken의 payload
   * @returns {ITokens} 토큰정보 (access, refresh)
   */
  async refreshAdminToken(
    payload: IAuthTokenPayload<IAdminClaim>,
  ): Promise<ITokens> {
    const admin: IAdmin = await this.validateAdminToken(payload);
    return this.generateAdminToken(admin, true);
  }

  async validateAdminToken(
    payload: IAuthTokenPayload<IAdminClaim>,
  ): Promise<IAdmin> {
    return this.adminService.findOneAdminOrFail(payload.claims.id);
  }

  async validateGatewayToken(
    payload: IAuthTokenPayload<IGatewayClaim>,
  ): Promise<IAdmin> {
    return this.adminService.findOneAdminOrFail(payload.claims.id);
  }

  /**
   * 유저 정보를 기반으로 한, 토큰 정보 생성
   * @param {IAdmin} user 사용자정보
   * @param {boolean} remember refresh 토큰 생성 여부
   * @returns {ITokens} 토큰정보 (access, refresh)
   */
  public generateAdminToken(user: IAdmin, remember?: boolean): ITokens {
    return {
      access: this.generateAdminAccessToken(user),
      refresh: remember ? this.generateAdminRefreshToken(user) : undefined,
    };
  }

  /**
   * 유저 정보를 기반으로 한, 엑세스 토큰 생성
   * @param {IAdmin} user 사용자정보
   * @returns {ITokenWithExp} 토큰정보 (token,exp)
   */
  public generateAdminAccessToken(user: IAdmin): ITokenWithExp {
    const tokenType: TOKEN_TYPE = TOKEN_TYPE.ACCESS;

    const duration = (this.config.get(`jwt.${tokenType}`) as number) ?? 1;

    return JwtUtil.generate(
      { data: user, type: CLAIM_TYPE.ADMIN },
      {
        tokenType,
        duration,
      },
      this.jwtService.sign,
    );
  }

  /**
   * 유저 정보를 기반으로 한, 리프레시 토큰 생성
   * @param {IAdmin} user 사용자정보
   * @returns {ITokenWithExp} 토큰정보 (token,exp)
   */
  public generateAdminRefreshToken(user: IAdmin): ITokenWithExp {
    const tokenType: TOKEN_TYPE = TOKEN_TYPE.REFRESH;

    const duration = (this.config.get(`jwt.${tokenType}`) as number) ?? 1;

    return JwtUtil.generate(
      { data: user, type: CLAIM_TYPE.ADMIN },
      {
        tokenType,
        duration,
      },
      this.jwtService.sign,
    );
  }

  /**
   * 유저 정보를 기반으로 한, 토큰정보 생성
   * @param {IAdmin} gateway 사용자정보
   * @returns {ITokenWithExp} 토큰정보 (token,exp)
   */
  public generateGatewayToken(gateway: IGatewayInfo): ITokenWithExp {
    const tokenType: TOKEN_TYPE = TOKEN_TYPE.REFRESH;

    const duration = (this.config.get(`jwt.${tokenType}`) as number) ?? 1;

    return JwtUtil.generate(
      { data: gateway, type: CLAIM_TYPE.ADMIN },
      {
        tokenType,
        duration,
      },
      this.jwtService.sign,
    );
  }

  public decodeJwtToken(token: string, options: JwtVerifyOptions) {
    return JwtUtil.decode(token, options, this.jwtService.verify);
  }

  /**
   * API 토큰 반환, 필요에 따라 쿠키에 토큰을 저장한다.
   * @param {Request} request 요청객체, domain 확인용
   * @param {Response} response 응답객체, 응답반환을 위해 필요
   * @param {ITokens} tokens 로그인을 통해 반환된 토큰 (access, refresh)
   * @returns {ICommonToken} 토큰들 (accessToken, refreshToken)
   */
  async loadTokens(
    request: Request,
    response: Response,
    tokens: ITokens,
    remember = false,
  ): Promise<void> {
    let secure = process.env.NODE_ENV == 'production';
    const domain = process.env.COOKIE_DOMAIN ?? request.hostname ?? 'localhost';

    if (domain == 'localhost' || domain == '127.0.0.1') secure = false;

    const { access, refresh } = tokens;
    const results: Partial<TokenDto> = {};

    if (remember && refresh) {
      response.cookie('refreshToken', refresh.token, {
        // domain,
        path: '/',
        secure,
        httpOnly: true,
        expires: moment(refresh.exp * 1000).toDate(),
        sameSite: secure ? 'none' : 'lax',
      });
      results.refreshToken = refresh.token;
    }
    if (access) {
      response.cookie('accessToken', access.token, {
        path: '/',
        expires: moment(access.exp * 1000).toDate(),
        secure,
        sameSite: secure ? 'none' : 'lax',
      });
      results.accessToken = access.token;
    }
    response.status(200).json(results);
  }

  /**
   * 토큰 삭제, 로그아웃을 위함.
   * @param {Response} response 응답객체, 응답반환을 위해 필요
   * @param {String} hostname domain 확인용
   * @returns {boolean} 토큰 삭제 완료 여부
   */
  clearTokens(response: Response, hostname?: string): void {
    let secure = process.env.NODE_ENV == 'production';
    const domain = process.env.COOKIE_DOMAIN ?? hostname ?? 'localhost';

    if (domain == 'localhost' || domain == '127.0.0.1') secure = false;

    response.clearCookie('refreshToken', {
      path: '/',
      secure,
      httpOnly: true,
      sameSite: secure ? 'none' : 'lax',
    });
    response
      .clearCookie('accessToken', {
        path: '/',
        secure,
        sameSite: secure ? 'none' : 'lax',
      })
      .status(200)
      .send(true);
  }
}
