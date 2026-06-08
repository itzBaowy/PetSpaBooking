export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PROVIDERS: '/providers',
  LOGIN: '/login',
  REGISTER: '/register-provider',
  FORGOT_PASSWORD: '/forgot-password',
  PROVIDER_DASHBOARD: '/dashboard/provider',
  ADMIN_DASHBOARD: '/dashboard/admin',
} as const;

export function getProviderRoute(path: string): string {
  return `/dashboard/provider${path}`;
}

export function getAdminRoute(path: string): string {
  return `/dashboard/admin${path}`;
}
