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
    AVATAR: "/users/avatar-cloud",
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
  MOBILE: {
    NOTIFICATIONS: {
      LIST: "/mobile/notifications",
      MARK_READ: (id: string) => `/mobile/notifications/${id}/read`,
      MARK_ALL_READ: "/mobile/notifications/read-all",
    },
  },
  VERIFICATION: {
    LIST: "/verification",
    DETAIL: (id: string) => `/verification/${id}`,
    APPROVE: (id: string) => `/verification/${id}`,
    REQUEST_INFO: (id: string) => `/verification/${id}/request-info`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard/summary",
    USERS: {
      LIST: "/admin/users",
      DETAIL: (id: string) => `/admin/users/${id}`,
      STATUS: (id: string) => `/admin/users/${id}/status`,
    },
    PROVIDERS: {
      LIST: "/admin/providers",
      PENDING: "/admin/providers/pending",
      DETAIL: (id: string) => `/admin/providers/${id}`,
      VERIFY: (id: string) => `/admin/providers/${id}/verify`,
      REJECT: (id: string) => `/admin/providers/${id}/reject`,
      SUSPEND: (id: string) => `/admin/providers/${id}/suspend`,
    },
    PROVIDER_DOCUMENTS: {
      APPROVE: (documentId: string) =>
        `/admin/provider-documents/${documentId}/approve`,
      REJECT: (documentId: string) =>
        `/admin/provider-documents/${documentId}/reject`,
    },
    BOOKINGS: {
      LIST: "/admin/bookings",
      DETAIL: (id: string) => `/admin/bookings/${id}`,
      FINANCE: (id: string) => `/admin/bookings/${id}/finance`,
    },
    DISPUTES: {
      LIST: "/admin/disputes",
      DETAIL: (id: string) => `/admin/disputes/${id}`,
      RESOLVE: (id: string) => `/admin/disputes/${id}/resolve`,
    },
    WALLET_TRANSACTIONS: "/admin/wallet-transactions",
    PROVIDER_WALLET: (id: string) => `/admin/providers/${id}/wallet`,
    ADJUST_PROVIDER_WALLET: (id: string) =>
      `/admin/providers/${id}/wallet/adjust`,
    REFUNDS: {
      LIST: "/admin/refunds",
      DETAIL: (bookingId: string) => `/admin/refunds/${bookingId}`,
      MARK_REFUNDED: (bookingId: string) =>
        `/admin/refunds/${bookingId}/mark-refunded`,
      REJECT: (bookingId: string) => `/admin/refunds/${bookingId}/reject`,
    },
    WITHDRAWALS: {
      LIST: "/admin/withdrawals",
      DETAIL: (id: string) => `/admin/withdrawals/${id}`,
      APPROVE: (id: string) => `/admin/withdrawals/${id}/approve`,
      REJECT: (id: string) => `/admin/withdrawals/${id}/reject`,
      MARK_PAID: (id: string) => `/admin/withdrawals/${id}/mark-paid`,
    },
    AUDIT_LOGS: "/admin/audit-logs",
    NOTIFICATIONS: {
      LIST: "/admin/notifications",
      SEND: "/admin/notifications/send",
      BROADCAST: "/admin/notifications/broadcast",
    },
    REPORTS: {
      REVENUE: "/admin/reports/revenue",
      DAILY_REVENUE: "/admin/reports/revenue/daily",
      PROVIDERS: "/admin/reports/providers",
      DISPUTES: "/admin/reports/disputes",
    },
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
      DETAIL: (serviceId: string) => `/admin/services/${serviceId}`,
      MODERATE: (serviceId: string) =>
        `/admin/services/${serviceId}/moderation`,
      HIDE: (serviceId: string) => `/admin/services/${serviceId}/hide`,
      UNHIDE: (serviceId: string) => `/admin/services/${serviceId}/unhide`,
    },
  },
} as const;
