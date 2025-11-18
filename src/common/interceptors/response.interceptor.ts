import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

type PaginatedPayload<U> = {
  data: U;
  meta: Record<string, unknown>;
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (this.isPaginatedPayload(data)) {
          const { data: paginatedData, meta } = data;

          return {
            success: true,
            data: paginatedData,
            meta,
            message: this.getDefaultMessage(statusCode),
            code: statusCode,
            errors: null,
          };
        }

        return {
          success: true,
          data: data as T,
          message: this.getDefaultMessage(statusCode),
          code: statusCode,
          errors: null,
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      [HttpStatus.OK]: 'Operación exitosa',
      [HttpStatus.CREATED]: 'Recurso creado exitosamente',
      [HttpStatus.NO_CONTENT]: 'Operación exitosa sin contenido',
      [HttpStatus.ACCEPTED]: 'Solicitud aceptada',
    };

    return messages[statusCode] || 'Operación completada';
  }

  private isPaginatedPayload(value: unknown): value is PaginatedPayload<T> {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Record<string, unknown>;
    const allowedKeys = ['data', 'meta'];
    const hasRequiredKeys = allowedKeys.every((key) => key in record);
    const noExtraKeys = Object.keys(record).every((key) =>
      allowedKeys.includes(key),
    );

    return hasRequiredKeys && noExtraKeys;
  }
}
