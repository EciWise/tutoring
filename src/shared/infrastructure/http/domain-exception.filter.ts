import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BusinessRuleViolation,
  ConflictError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors/domain-error';

/**
 * Traduce los errores de dominio a respuestas HTTP. El dominio nunca conoce
 * HTTP; este filtro es la frontera. Cualquier `DomainError` no mapeado cae a
 * 400 por defecto.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.statusFor(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private statusFor(error: DomainError): number {
    if (error instanceof ValidationError) {
      return HttpStatus.BAD_REQUEST; // 400
    }
    if (error instanceof NotFoundError) {
      return HttpStatus.NOT_FOUND; // 404
    }
    if (error instanceof ConflictError) {
      return HttpStatus.CONFLICT; // 409
    }
    if (error instanceof BusinessRuleViolation) {
      return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
    return HttpStatus.BAD_REQUEST;
  }
}
