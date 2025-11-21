/**
 * Environment variable validation utility
 * Ensures all required environment variables are present and valid
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates required environment variables
 * @throws {EnvValidationError} If required variables are missing or invalid
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const nodeEnv = import.meta.env.MODE || import.meta.env.NODE_ENV || 'development';

  if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
    errors.push('VITE_SUPABASE_URL is required and must be a non-empty string');
  } else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must be a valid URL starting with http:// or https://');
  }

  if (!supabaseKey || typeof supabaseKey !== 'string' || supabaseKey.trim() === '') {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY is required and must be a non-empty string');
  }

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: development, production, test. Got: ${nodeEnv}`);
  }

  if (errors.length > 0) {
    throw new EnvValidationError(
      `Environment validation failed:\n${errors.join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test'
  };
}

/**
 * Get validated environment configuration
 * Validates on first call and caches the result
 */
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

