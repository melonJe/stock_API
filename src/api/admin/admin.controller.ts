import {
  Controller,
  UseGuards,
  Req,
  Get,
  UseFilters,
  UseInterceptors,
  Put,
  Patch,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';

import { HttpExceptionFilter } from '@common/filters';
import { AuthorityInterceptor } from '@common/middlewares';
import { JwtAdminAccessGuard } from '@api/auth/guards';
import {
  IAdmin,
  IAdminClaim,
  IAuthTokenPayload,
  IPaginatedResponse,
} from '@common/interfaces';
import { UpdateAdminDto, AdminDto } from './dtos';
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
import { PaginatedResponseDto } from '@common/dtos/pagination.dto';

@Controller('admin')
@UseInterceptors(AuthorityInterceptor)
@UseFilters(HttpExceptionFilter)
@ApiTags('Admin')
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
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 사용자 정보
   * @authorization {string} accessToken
   * @returns {CommonUserDto} 사용자 정보
   */
  @UseGuards(JwtAdminAccessGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 정보',
    description: '엑세스 토큰을 사용해, 사용자 정보를 요청합니다.',
  })
  @ApiOkResponse({
    description: '사용자 정보',
    type: AdminDto,
  })
  async findMe(
    @Req() request: { user: IAuthTokenPayload<IAdminClaim> },
  ): Promise<IAdmin> {
    return this.adminService.findOneAdmin(request.user.claims.id);
  }

  /**
   * 사용자 정보
   * @authorization {string} accessToken
   * @returns {CommonUserDto} 사용자 정보
   */
  // @UseGuards(JwtAdminAccessGuard)
  // @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: '관리자 목록',
    description: '엑세스 토큰을 사용해, 관리자 목록을 요청합니다.',
  })
  @ApiOkResponse({
    description: '관리자 목록',
    type: PaginatedResponseDto<AdminDto>,
  })
  async findAllAdmin(): Promise<IPaginatedResponse<IAdmin>> {
    return this.adminService.findAllAdmin();
  }

  /**
   * 사용자 정보 업데이트
   * @authorization {string} accessToken
   * @param {UpdateUserV3Dto} body 수정할 정보
   * @returns {Boolean} 업데이트 결과
   */
  @UseGuards(JwtAdminAccessGuard)
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 정보 업데이트',
    description: '엑세스 토큰을 사용해, 사용자 정보를 업데이트합니다.',
  })
  @ApiOkResponse({
    description: '업데이트 결과',
    type: Boolean,
  })
  async putUpdateMe(
    @Req() request: { user: IAuthTokenPayload<any> },
    @Body() body: UpdateAdminDto,
  ): Promise<boolean> {
    return this.adminService.updateAdmin(request.user.claims.id, body);
  }

  /**
   * 사용자 정보 업데이트
   * @authorization {string} accessToken
   * @param {UpdateUserV3Dto} body 수정할 정보
   * @returns {Boolean} 업데이트 결과
   */
  @UseGuards(JwtAdminAccessGuard)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 정보 업데이트',
    description: '엑세스 토큰을 사용해, 사용자 정보를 업데이트합니다.',
  })
  @ApiOkResponse({
    description: '업데이트 결과',
    type: Boolean,
  })
  async patchUpdateMe(
    @Req() request: { user: IAuthTokenPayload<any> },
    @Body() body: UpdateAdminDto,
  ): Promise<boolean> {
    return this.adminService.updateAdmin(request.user.claims.id, body);
  }

  // /**
  //  * 사용자 정보 삭제
  //  * @authorization {string} accessToken
  //  * @returns {Boolean} 처리 결과
  //  */
  // @UseGuards(JwtAdminAccessGuard)
  // @Delete('me')
  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '사용자 정보 삭제',
  //   description: '엑세스 토큰을 사용해, 사용자 정보를 삭제합니다.',
  // })
  // @ApiOkResponse({
  //   description: '삭제 결과',
  //   type: Boolean,
  // })
  // async deleteMe(
  //   @Req()
  //   request: {
  //     user: IAuthTokenPayload<any>;
  //     headers?: {
  //       authorization: string;
  //     };
  //   },
  // ): Promise<boolean> {
  //   return await this.adminService.deleteOne(
  //     request.user.user_claims.user_id,
  //     request.user.user_claims.appname,
  //     request.headers?.authorization,
  //   );
  // }
}
