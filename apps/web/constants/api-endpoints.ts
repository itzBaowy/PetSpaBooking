export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/get-info",
    REFRESH: "/auth/refresh-token",
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
      RECORDS: "/admin/finance/commission",
      PENDING: "/admin/finance/commission/pending",
      CONFIGS: "/admin/finance/commission/config",
      UPDATE_CONFIG: (configId: string) =>
        `/admin/finance/commission/config/${configId}`,
    },
  },
} as const;
