import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IErrorResponse } from '@common/interfaces';
import { isArray } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const {
        statusCode,
        error,
        message: messages = [''],
      } = exception.getResponse() as IErrorResponse;

      let message: string | string[];
      // 에러 메시지 배열을 하나로만 전달 (기존 API와의 호환성)
      if (isArray(messages)) {
        message = messages.length > 2 ? messages : messages[0];
      } else message = messages as string;
      // 에러 메시지 배열을 하나로만 전달 (기존 API와의 호환성)

      if (process.env.DEBUG_CONSOLE)
        console.error({
          global: {
            statusCode,
            error,
            message,
          },
        });

      httpAdapter.reply(
        context.getResponse(),
        {
          statusCode,
          error,
          message,
        },
        status,
      );
    }

    httpAdapter.reply(
      context.getResponse(),
      {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(context.getRequest()),
      },
      status,
    );
  }
}
