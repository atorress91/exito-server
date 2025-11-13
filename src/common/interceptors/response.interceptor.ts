import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data,
        message: this.getDefaultMessage(statusCode),
        code: statusCode,
        errors: null,
      })),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: { [key: number]: string } = {
      [HttpStatus.OK]: 'Operación exitosa',
      [HttpStatus.CREATED]: 'Recurso creado exitosamente',
      [HttpStatus.NO_CONTENT]: 'Operación exitosa sin contenido',
      [HttpStatus.ACCEPTED]: 'Solicitud aceptada',
    };

    return messages[statusCode] || 'Operación completada';
  }
}
