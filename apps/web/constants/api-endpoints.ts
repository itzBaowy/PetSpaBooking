export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },
  SERVICES: {
    LIST: "/services",
    CREATE: "/services",
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
  },
  BOOKINGS: {
    LIST: "/bookings",
    CREATE: "/bookings",
    UPDATE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
} as const;
