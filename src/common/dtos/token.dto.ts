import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ description: '엑세스 토큰' })
  accessToken: string;
  @ApiProperty({ description: '리프레시 토큰', nullable: true })
  refreshToken?: string;
}
