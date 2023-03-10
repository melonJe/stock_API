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
   * ????????? ?????? ?????????, ?????? ???????????? ???????????? ????????? ?????? ??? ????????????.
   * @param {IAuthTokenPayload} payload accessToken??? payload
   * @returns {ITokens} ???????????? (access, refresh)
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
   * ?????? ????????? ???????????? ???, ?????? ?????? ??????
   * @param {IAdmin} user ???????????????
   * @param {boolean} remember refresh ?????? ?????? ??????
   * @returns {ITokens} ???????????? (access, refresh)
   */
  public generateAdminToken(user: IAdmin, remember?: boolean): ITokens {
    return {
      access: this.generateAdminAccessToken(user),
      refresh: remember ? this.generateAdminRefreshToken(user) : undefined,
    };
  }

  /**
   * ?????? ????????? ???????????? ???, ????????? ?????? ??????
   * @param {IAdmin} user ???????????????
   * @returns {ITokenWithExp} ???????????? (token,exp)
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
   * ?????? ????????? ???????????? ???, ???????????? ?????? ??????
   * @param {IAdmin} user ???????????????
   * @returns {ITokenWithExp} ???????????? (token,exp)
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
   * ?????? ????????? ???????????? ???, ???????????? ??????
   * @param {IAdmin} gateway ???????????????
   * @returns {ITokenWithExp} ???????????? (token,exp)
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
   * API ?????? ??????, ????????? ?????? ????????? ????????? ????????????.
   * @param {Request} request ????????????, domain ?????????
   * @param {Response} response ????????????, ??????????????? ?????? ??????
   * @param {ITokens} tokens ???????????? ?????? ????????? ?????? (access, refresh)
   * @returns {ICommonToken} ????????? (accessToken, refreshToken)
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
   * ?????? ??????, ??????????????? ??????.
   * @param {Response} response ????????????, ??????????????? ?????? ??????
   * @param {String} hostname domain ?????????
   * @returns {boolean} ?????? ?????? ?????? ??????
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
