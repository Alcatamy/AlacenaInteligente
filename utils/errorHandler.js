class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud incorrecta', errorCode = null) {
    super(message, 400, errorCode);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', errorCode = null) {
    super(message, 401, errorCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido', errorCode = null) {
    super(message, 403, errorCode);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', errorCode = null) {
    super(message, 404, errorCode);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto con el recurso actual', errorCode = null) {
    super(message, 409, errorCode);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Error de validación', errorCode = null, errors = {}) {
    super(message, 422, errorCode);
    this.errors = errors;
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Error interno del servidor', errorCode = null) {
    super(message, 500, errorCode);
  }
}

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = {};
    err.errors.forEach(e => {
      errors[e.path] = e.message;
    });
    
    error = new ValidationError('Error de validación', 'VALIDATION_ERROR', errors);
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    err.errors.forEach(e => {
      errors[e.path] = `${e.path} ya está en uso`;
    });
    
    error = new ConflictError('El recurso ya existe', 'RESOURCE_EXISTS', errors);
  }
  
  // Enviar respuesta
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(error.errors && { errors: error.errors }),
    ...(error.errorCode && { errorCode: error.errorCode }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  errorHandler
}; 