/**
 * Centralized error handling utility
 * Provides consistent error handling, logging, and user feedback
 */

import { toast } from 'sonner';
import { isDevelopment } from './envValidation';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  userMessage?: string;
  isUserFacing?: boolean;
  shouldLog?: boolean;
}

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  AUTHENTICATION_ERROR = 'AUTH_ERROR',
  AUTHORIZATION_ERROR = 'AUTHZ_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Creates a standardized application error
 */
export function createAppError(
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  options?: {
    statusCode?: number;
    userMessage?: string;
    isUserFacing?: boolean;
    shouldLog?: boolean;
    originalError?: unknown;
  }
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.statusCode = options?.statusCode;
  error.userMessage = options?.userMessage || message;
  error.isUserFacing = options?.isUserFacing ?? true;
  error.shouldLog = options?.shouldLog ?? true;

  if (options?.originalError instanceof Error) {
    error.stack = options.originalError.stack;
    error.cause = options.originalError;
  }

  return error;
}

/**
 * Safely logs errors without exposing sensitive information
 */
function safeLogError(error: unknown, context?: string): void {
  if (!isDevelopment()) {
    // In production, only log to error tracking service
    // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
    return;
  }

  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      name: error.name,
      message: error.message,
      code: (error as AppError).code,
      stack: error.stack
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error);
  }
}

/**
 * Handles errors with appropriate user feedback and logging
 */
export function handleError(
  error: unknown,
  context?: string,
  options?: {
    showToast?: boolean;
    fallbackMessage?: string;
  }
): AppError {
  const showToast = options?.showToast ?? true;
  const fallbackMessage = options?.fallbackMessage || 'An unexpected error occurred';

  let appError: AppError;

  if (error instanceof Error) {
    appError = error as AppError;
    
    // Enhance error with context if provided
    if (context && !appError.message.includes(context)) {
      appError.message = `${context}: ${appError.message}`;
    }
  } else {
    appError = createAppError(
      typeof error === 'string' ? error : fallbackMessage,
      ErrorCode.UNKNOWN_ERROR,
      { shouldLog: true }
    );
  }

  // Log error if needed
  if (appError.shouldLog !== false) {
    safeLogError(appError, context);
  }

  // Show user-facing error
  if (showToast && appError.isUserFacing !== false) {
    const userMessage = appError.userMessage || appError.message || fallbackMessage;
    
    // Don't show technical errors to users
    const sanitizedMessage = sanitizeErrorMessage(userMessage);
    toast.error(sanitizedMessage);
  }

  return appError;
}

/**
 * Sanitizes error messages to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential PHI or sensitive data patterns
  let sanitized = message;

  // Remove email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]');

  // Remove potential SSN patterns
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Remove potential phone numbers
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]');

  // Remove stack traces
  sanitized = sanitized.split('\n')[0];

  return sanitized;
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, context || fn.name);
    }
  }) as T;
}

/**
 * Handles Supabase-specific errors
 */
export function handleSupabaseError(error: unknown, context?: string): AppError {
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string; details?: string };
    
    let code = ErrorCode.DATABASE_ERROR;
    let userMessage = 'A database error occurred';

    // Map common Supabase error codes
    if (supabaseError.code === 'PGRST116' || supabaseError.message.includes('JWT')) {
      code = ErrorCode.AUTHENTICATION_ERROR;
      userMessage = 'Authentication failed. Please log in again.';
    } else if (supabaseError.message.includes('permission') || supabaseError.message.includes('RLS')) {
      code = ErrorCode.AUTHORIZATION_ERROR;
      userMessage = 'You do not have permission to perform this action.';
    } else if (supabaseError.message.includes('network') || supabaseError.message.includes('fetch')) {
      code = ErrorCode.NETWORK_ERROR;
      userMessage = 'Network error. Please check your connection and try again.';
    }

    return createAppError(
      supabaseError.message,
      code,
      {
        userMessage,
        isUserFacing: true,
        shouldLog: true,
        originalError: error
      }
    );
  }

  return handleError(error, context);
}

/**
 * Handles blockchain/Web3 errors
 */
export function handleBlockchainError(error: unknown, context?: string): AppError {
  if (error instanceof Error) {
    let code = ErrorCode.BLOCKCHAIN_ERROR;
    let userMessage = 'A blockchain transaction error occurred';

    if (error.message.includes('user rejected') || error.message.includes('User denied')) {
      userMessage = 'Transaction was cancelled';
    } else if (error.message.includes('insufficient funds') || error.message.includes('gas')) {
      userMessage = 'Insufficient funds for this transaction';
    } else if (error.message.includes('network') || error.message.includes('provider')) {
      userMessage = 'Blockchain network error. Please check your connection.';
    }

    return createAppError(
      error.message,
      code,
      {
        userMessage,
        isUserFacing: true,
        shouldLog: true,
        originalError: error
      }
    );
  }

  return handleError(error, context);
}

