import { ApiProperty } from '@nestjs/swagger';
import { ERROR_CODE } from '@common/enums';
import { IErrorResponse } from '@common/interfaces';

export class CommonErrorDto implements Partial<IErrorResponse> {
  @ApiProperty({
    description: '내부 에러코드',
    default: 1000,
    enum: ERROR_CODE,
    enumName: 'ERROR_CODE',
  })
  statusCode: ERROR_CODE;

  @ApiProperty({ description: '에러메시지' })
  message: string;
  @ApiProperty({
    description: '에러가 난 패러미터',
    nullable: true,
    required: false,
  })
  params?: string;
}
