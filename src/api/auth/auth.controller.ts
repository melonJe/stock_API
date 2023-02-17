import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  UseFilters,
  UseInterceptors,
  Res,
} from '@nestjs/common';

import { JwtAdminRefreshGuard, LocalAdminGuard } from './guards';
import { HttpExceptionFilter } from '@common/filters';
import { AuthorityInterceptor } from '@common/middlewares';
import { AuthService } from '@api/auth/auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dtos';
import { IAdminClaim, IAuthTokenPayload } from '@common/interfaces';
import { IAdmin } from '@common/interfaces';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommonErrorDto } from '@common/dtos';
import { TokenDto } from '@common/dtos/token.dto';

@Controller('auth')
@UseInterceptors(AuthorityInterceptor)
@UseFilters(HttpExceptionFilter)
@ApiTags('Auth')
@ApiBadRequestResponse({
  description: '필수 인자가 없거나, 유효하지 않습니다.',
  type: CommonErrorDto,
})
@ApiUnauthorizedResponse({
  description: '인증 실패',
  type: CommonErrorDto,
})
@ApiForbiddenResponse({
  description: '권한 부족',
  type: CommonErrorDto,
})
@ApiNotFoundResponse({
  description: '해당 리소스 없음',
  type: CommonErrorDto,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 로그인
   * @param {LoginDto} body (username, password)
   * @returns {ICommonToken} token 객체 (accessToken, refreshToken)
   */
  @UseGuards(LocalAdminGuard)
  @Post('/sign-in')
  @ApiOperation({
    summary: '이메일 로그인',
    description: '로그인을 통해 엑세스+리프레시 토큰을 발급합니다.',
  })
  @ApiOkResponse({
    description: '토큰',
    type: TokenDto,
  })
  async login(
    @Req() request: Request & { user: IAdmin },
    @Res() response: Response,
    @Body() body: LoginDto,
  ): Promise<void> {
    const tokens = this.authService.generateAdminToken(
      request.user,
      body.remember,
    );
    this.authService.loadTokens(request, response, tokens, body.remember);
  }

  /**
   * 토큰 재발급
   * @authorization {string} refreshToken
   * @returns {ICommonToken} token 객체 (access_token, refresh_token)
   */
  @UseGuards(JwtAdminRefreshGuard)
  @Get('/token/refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '토큰 재발행',
    description: '리프레시 토큰을 사용해, 엑세스+리프레시 토큰을 재발급합니다.',
  })
  @ApiOkResponse({
    description: '토큰',
    type: TokenDto,
  })
  async refreshAdmin(
    @Req() request: Request & { user: IAuthTokenPayload<IAdminClaim> },
    @Res() response: Response,
  ): Promise<void> {
    const tokens = await this.authService.refreshAdminToken(request.user);
    this.authService.loadTokens(request, response, tokens, true);
  }

  /**
   * 로그아웃
   * @returns {boolean} 로그아웃 실행 결과
   */
  @Post('/sign-out')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그인된 사용자의 토큰을 만료시킵니다.',
  })
  @ApiOkResponse({
    description: '로그아웃 결과',
    type: Boolean,
  })
  logout(@Req() request: Request, @Res() response: Response): void {
    this.authService.clearTokens(response, request.hostname);
  }
}
