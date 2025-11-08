/**
 * Clerk Configuration and Utilities
 * 
 * This file manages Clerk authentication configuration.
 * HIPAA Compliance: Clerk provides BAA (Business Associate Agreement) on their enterprise plan.
 */

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Authentication appearance configuration
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    socialButtonsVariant: 'iconButton' as const,
  },
  variables: {
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--background))',
    colorInputBackground: 'hsl(var(--input))',
    colorInputText: 'hsl(var(--foreground))',
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',
    borderRadius: '0.5rem',
  },
};

// Available authentication methods
export const authenticationMethods = {
  email: true,
  phone: true,
  username: true,
  google: true,
  microsoft: true,
  apple: true,
  facebook: true,
  github: true,
  linkedin: true,
};
