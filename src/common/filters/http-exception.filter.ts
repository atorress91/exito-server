import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

type ErrorDetails = string[] | string | null;

interface ParsedExceptionResult {
  status: number;
  message: string;
  errors: ErrorDetails;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errors } = this.parseException(exception);

    this.logError(request, status, message, exception);

    const errorResponse: ApiResponse = {
      success: false,
      data: null,
      message,
      code: status,
      errors: this.formatErrors(errors),
    };

    response.status(status).json(errorResponse);
  }

  private parseException(exception: unknown): ParsedExceptionResult {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: ErrorDetails = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const parsed = this.parseHttpException(exception);
      message = parsed.message;
      errors = parsed.errors;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    return { status, message, errors };
  }

  private parseHttpException(exception: HttpException): {
    message: string;
    errors: ErrorDetails;
  } {
    const exceptionResponse = exception.getResponse();
    let message = 'Error interno del servidor';
    let errors: ErrorDetails = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      message = this.extractMessage(responseObj) || message;
      errors = Array.isArray(responseObj.message) ? responseObj.message : null;
    }

    return { message, errors };
  }

  private extractMessage(responseObj: Record<string, unknown>): string | null {
    if (typeof responseObj.message === 'string') {
      return responseObj.message;
    }
    if (typeof responseObj.error === 'string') {
      return responseObj.error;
    }
    return null;
  }

  private formatErrors(errors: ErrorDetails): string[] | null {
    if (Array.isArray(errors)) {
      return errors;
    }
    return errors ? [errors] : null;
  }

  private logError(
    request: Request,
    status: number,
    message: string,
    exception: unknown,
  ): void {
    const errorLog = `${request.method} ${request.url} - Status: ${status} - Message: ${message}`;
    const stackTrace = exception instanceof Error ? exception.stack : '';
    this.logger.error(errorLog, stackTrace);
  }
}
