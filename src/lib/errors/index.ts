export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): {
  status: number;
  message: string;
  details?: unknown;
} {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('duplicate key')) {
      return {
        status: 409,
        message: 'Resource already exists',
      };
    }

    if (error.message.includes('foreign key')) {
      return {
        status: 400,
        message: 'Invalid reference to related resource',
      };
    }

    if (error.message.includes('not found')) {
      return {
        status: 404,
        message: 'Resource not found',
      };
    }

    // Database connection errors
    if (error.message.includes('connection')) {
      return {
        status: 503,
        message: 'Database connection error',
      };
    }

    return {
      status: 500,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
  };
}

// Error response helper
export function createErrorResponse(error: unknown) {
  const { status, message, details } = handleApiError(error);
  
  return Response.json(
    { 
      success: false, 
      error: message, 
      details: process.env.NODE_ENV === 'development' ? details : undefined 
    },
    { status }
  );
}

// Success response helper
export function createSuccessResponse<T>(data: T, message?: string, status: number = 200) {
  return Response.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// Async error handler wrapper for API routes
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

// Client-side error handler
export function handleClientError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Toast notification helper for errors
export interface ErrorToastOptions {
  title?: string;
  description?: string;
  variant?: 'destructive' | 'default';
}

export function getErrorToastOptions(error: unknown): ErrorToastOptions {
  const message = handleClientError(error);
  
  if (message.includes('network') || message.includes('fetch')) {
    return {
      title: 'Connection Error',
      description: 'Please check your internet connection and try again.',
      variant: 'destructive',
    };
  }
  
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return {
      title: 'Authentication Error',
      description: 'Please sign in to continue.',
      variant: 'destructive',
    };
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return {
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
    };
  }
  
  return {
    title: 'Error',
    description: message,
    variant: 'destructive',
  };
}
