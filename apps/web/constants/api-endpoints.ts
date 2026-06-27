export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/get-info",
    REFRESH: "/auth/refresh-token",
  },
  BANKS: {
    LIST: "/banks",
  },
  PROVIDERS: {
    ME: "/providers/me",
    REGISTER: "/providers/register",
    MY_DOCUMENTS: "/providers/me/documents",
    LIST: "/providers",
    DETAIL: (id: string) => `/providers/${id}`,
    APPROVE: (id: string) => `/providers/${id}/approve`,
    REJECT: (id: string) => `/providers/${id}/reject`,
    SUSPEND: (id: string) => `/providers/${id}/suspend`,
  },
  USERS: {
    LIST: "/users",
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
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
  VERIFICATION: {
    LIST: "/verification",
    DETAIL: (id: string) => `/verification/${id}`,
    APPROVE: (id: string) => `/verification/${id}`,
    REQUEST_INFO: (id: string) => `/verification/${id}/request-info`,
  },
  ADMIN: {
    FINANCE: {
      BALANCES: "/admin/finance/balances",
      LEDGER: "/admin/finance/ledger",
      PROVIDER_BALANCE: (providerId: string) =>
        `/admin/providers/${providerId}/balance`,
      DEBTS: "/admin/finance/debts",
      ADJUST_BALANCE: "/admin/finance/adjustments",
    },
    COMMISSION: {
      SUMMARY: "/admin/finance/commissions/summary",
      RECORDS: "/admin/finance/commissions",
      PENDING: "/admin/finance/commissions/pending",
      CONFIGS: "/admin/config/commissions",
      UPDATE_CONFIG: (configId: string) =>
        `/admin/config/commissions/${configId}`,
    },
    SERVICES: {
      LIST: "/admin/services",
      MODERATE: (serviceId: string) =>
        `/admin/services/${serviceId}/moderation`,
      HIDE: (serviceId: string) => `/admin/services/${serviceId}/hide`,
      UNHIDE: (serviceId: string) => `/admin/services/${serviceId}/unhide`,
    },
  },
} as const;
