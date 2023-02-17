import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { IErrorResponse } from '@common/interfaces/message.interface';
import { isArray } from 'class-validator';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const status = exception.getStatus();
    const {
      statusCode,
      error,
      message: messages,
      params,
    } = exception.getResponse() as IErrorResponse;

    let message = '';
    if (isArray(messages)) message = messages[0] ?? '';
    else message = messages as string;

    response.status(status).json({
      statusCode,
      error,
      message,
      params,
    });
  }
}
