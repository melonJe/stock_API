import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Common')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'API 상태 확인',
    description: 'API 서버의 버전과, 현재 모드를 확인한다',
  })
  @ApiOkResponse({
    description: 'API의 버전과 현재 모드',
    schema: {
      type: 'string',
      example: 'BOCOS Server is working..v1.0.0 Mode: dev',
    },
  })
  health() {
    return (
      '<span style="font-family: monospace;">"BOCOS Server is working..v1.0.0 Mode: ' +
      this.configService.get('server.mode') +
      '"</span>'
    );
  }
}
