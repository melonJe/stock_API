import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IAdmin } from '@common/interfaces';

export class CreateAdminDto {
  @IsNotEmpty()
  @ApiProperty({ description: '사용자 계정' })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '이름' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '패스워드' })
  password: string;
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '이름' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '패스워드' })
  password: string;
}

export class AdminDto implements Partial<IAdmin> {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({
    description: '사용여부',
  })
  available: boolean;

  // @ApiProperty({ description: '권한' })
  // roles?: string[];

  @ApiProperty({
    description: '가입일',
  })
  createdAt: Date;
}
