export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
    login: () => [...queryKeys.auth.all, "login"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  banks: {
    all: ["banks"] as const,
    list: () => [...queryKeys.banks.all, "list"] as const,
  },
  providerVerification: {
    all: ["providerVerification"] as const,
    me: () => [...queryKeys.providerVerification.all, "me"] as const,
    documents: () =>
      [...queryKeys.providerVerification.all, "documents"] as const,
  },
  services: {
    all: ["services"] as const,
    lists: () => [...queryKeys.services.all, "list"] as const,
    detail: (id: string) => [...queryKeys.services.all, "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    detail: (id: string) => [...queryKeys.bookings.all, "detail", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    lists: () => [...queryKeys.customers.all, "list"] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
  },
  verification: {
    all: ["verification"] as const,
    lists: () => [...queryKeys.verification.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.verification.all, "detail", id] as const,
  },
  adminFinance: {
    all: ["admin", "finance"] as const,
    balances: () => [...queryKeys.adminFinance.all, "balances"] as const,
    ledger: () => [...queryKeys.adminFinance.all, "ledger"] as const,
    providerBalance: (providerId: string) =>
      [...queryKeys.adminFinance.all, "provider-balance", providerId] as const,
    debts: () => [...queryKeys.adminFinance.all, "debts"] as const,
  },
  adminCommission: {
    all: ["admin", "commission"] as const,
    records: () => [...queryKeys.adminCommission.all, "records"] as const,
    pending: () => [...queryKeys.adminCommission.all, "pending"] as const,
    configs: () => [...queryKeys.adminCommission.all, "configs"] as const,
    summary: () => [...queryKeys.adminCommission.all, "summary"] as const,
  },
  adminUsers: {
    all: ["admin", "users"] as const,
    lists: () => [...queryKeys.adminUsers.all, "list"] as const,
    list: (params: unknown) =>
      [...queryKeys.adminUsers.lists(), params] as const,
    detail: (id: string) => [...queryKeys.adminUsers.all, "detail", id] as const,
  },
} as const;
