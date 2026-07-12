export type ApiEnvelope<T> = { data: T; message: string; statusCode: number };

export type ProviderPagination = {
  page: number; pageSize: number; totalItems: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
};
export type ProviderPage<T> = { items: T[]; pagination: ProviderPagination };

export type ProviderBookingApi = {
  id: string; status: string; paymentMethod: string; paymentStatus: string;
  appointmentStart: string; appointmentEnd: string; totalAmount: number;
  rejectReason?: string | null; cancelReason?: string | null;
  customer?: { users?: { fullName?: string; email?: string; phone?: string } };
  pet?: { name?: string; species?: string; breed?: string };
  service?: { name?: string; price?: number; duration?: number };
};

export type ProviderServiceApi = {
  id: string; name: string; description?: string | null; price: number;
  duration: number; isActive: boolean; isHiddenByAdmin: boolean;
  category?: { name?: string } | null; updateAt?: string; createAt?: string;
};
export type ProviderServicePage = { page: number; pageSize: number; totalItem: number; totalPage: number; items: ProviderServiceApi[] };

export type WorkingHourApi = {
  id?: string; dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean;
};
export type AvailabilityBlockApi = {
  id: string; startAt: string; endAt: string; reason?: string | null;
};
export type ProviderWalletApi = {
  id: string; walletBalance: number; depositBalance: number; depositStatus: string;
};
export type WalletTransactionApi = {
  id: string; type: string; amount: number; balanceAfter: number;
  note?: string | null; referenceId?: string | null; createAt: string;
};
export type WithdrawalApi = {
  id: string; amount: number; bankCode: string; bankAccountNumber: string;
  bankAccountName: string; reason?: string | null; status: string;
  requestedAt: string; processedAt?: string | null;
};
export type ProviderNotificationApi = {
  id: string; type: string; title: string; message: string; isRead: boolean;
  data?: Record<string, unknown> | null; createAt: string;
};
