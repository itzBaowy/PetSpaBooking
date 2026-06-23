export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  SERVICES: "/services",
  PROVIDERS: "/providers",
  LOGIN: "/login",
  REGISTER: "/register-provider",
  FORGOT_PASSWORD: "/forgot-password",
  PROVIDER_DASHBOARD: "/provider",
  ADMIN_DASHBOARD: "/admin",
} as const;

export function getProviderRoute(path: string): string {
  return `/provider${path}`;
}

export function getAdminRoute(path: string): string {
  return `/admin${path}`;
}
