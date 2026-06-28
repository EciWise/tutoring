/**
 * Errores de dominio. El dominio NUNCA lanza `HttpException`; lanza estos tipos
 * y un `ExceptionFilter` en infraestructura los traduce a códigos HTTP
 * (ValidationError→400, NotFoundError→404, ConflictError→409,
 * BusinessRuleViolation→422). Ver `DomainExceptionFilter`.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    // El nombre es la subclase concreta (p.ej. "ValidationError"); se expone en la
    // respuesta HTTP y en logs.
    this.name = new.target.name;
    // Garantiza que `instanceof` funcione aun si el target de compilación cambia.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Dato inválido respecto a una invariante de valor (rangos, formato, coherencia). */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/** Violación de una regla de negocio (RN-xx) sobre estado agregado válido. */
export class BusinessRuleViolation extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/** Recurso referenciado que no existe. */
export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/** Conflicto de unicidad o de estado concurrente (p.ej. cupo agotado, duplicado). */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
