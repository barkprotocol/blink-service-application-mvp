/**
 * Custom API Error class for handling and formatting API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  isOperational: boolean;

  /**
   * Create an ApiError instance
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param errors - Array of additional error messages
   * @param isOperational - Whether the error is operational or programming
   */
  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create a Bad Request (400) error
   * @param message - Error message
   * @param errors - Array of additional error messages
   */
  static badRequest(message: string, errors: string[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  /**
   * Create an Unauthorized (401) error
   * @param message - Error message
   * @param errors - Array of additional error messages
   */
  static unauthorized(message: string, errors: string[] = []): ApiError {
    return new ApiError(401, message, errors);
  }

  /**
   * Create a Forbidden (403) error
   * @param message - Error message
   * @param errors - Array of additional error messages
   */
  static forbidden(message: string, errors: string[] = []): ApiError {
    return new ApiError(403, message, errors);
  }

  /**
   * Create a Not Found (404) error
   * @param message - Error message
   * @param errors - Array of additional error messages
   */
  static notFound(message: string, errors: string[] = []): ApiError {
    return new ApiError(404, message, errors);
  }

  /**
   * Create an Internal Server Error (500)
   * @param message - Error message
   * @param errors - Array of additional error messages
   */
  static internal(message: string, errors: string[] = []): ApiError {
    return new ApiError(500, message, errors, false);
  }

  /**
   * Convert the error to a plain object for JSON responses
   */
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

