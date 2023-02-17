import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ILogin } from '@common/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto implements ILogin {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '사용자 이메일' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '사용자 패스워드' })
  password: string;

  @IsBoolean()
  @ApiProperty({
    description: '리프레시 토큰 발급여부',
    type: 'boolean',
    default: false,
    nullable: true,
    required: false,
  })
  @IsOptional()
  remember?: boolean;
}
