export const PERMISSIONS = {
  // Provider permissions
  MANAGE_SERVICES: 'manage:services',
  MANAGE_BOOKINGS: 'manage:bookings',
  VIEW_REVENUE: 'view:revenue',
  MANAGE_PROFILE: 'manage:profile',
  
  // Admin permissions
  MANAGE_USERS: 'manage:users',
  MANAGE_PROVIDERS: 'manage:providers',
  VERIFY_PROVIDERS: 'verify:providers',
  VIEW_ANALYTICS: 'view:analytics',
  MODERATE_CONTENT: 'moderate:content',
  RESOLVE_DISPUTES: 'resolve:disputes',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
