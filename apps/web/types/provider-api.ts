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
  customer?: { id?: string; users?: { fullName?: string; email?: string; phone?: string } };
  pet?: { name?: string; species?: string; breed?: string; ageLabel?: string; imageUrl?: string | null };
  service?: { name?: string; price?: number; duration?: number };
};

export type ProviderServiceApi = {
  id: string; name: string; description?: string | null; price: number;
  duration: number; isActive: boolean; isHiddenByAdmin: boolean;
  category?: { name?: string } | null; imageUrls?: string[]; updateAt?: string; createAt?: string;
};
export type ProviderServicePage = { page: number; pageSize: number; totalItem: number; totalPage: number; items: ProviderServiceApi[] };

export type WorkingHourApi = {
  id?: string; dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean;
};
export type AvailabilityBlockApi = {
  id: string; startAt: string; endAt: string; reason?: string | null;
};
export type AvailabilityBlockPayload = {
  startAt: string; endAt: string; reason?: string;
};
export type ProviderWalletApi = {
  id: string; walletBalance: number; depositBalance: number; depositStatus: string;
};
export type ProviderDepositPaymentApi = {
  providerId: string; orderId: string; requestId: string; amount: number;
  payUrl?: string | null; deeplink?: string | null; qrCodeUrl?: string | null;
  status: string;
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
export type ProviderChatThreadApi = {
  id: string;
  bookingId?: string | null;
  unreadCount?: number;
  lastMessageAt?: string | null;
  customer?: {
    id?: string;
    fullName?: string;
    name?: string;
    avatar?: string | null;
    avatarUrl?: string | null;
    users?: { fullName?: string | null; name?: string | null; avatar?: string | null; avatarUrl?: string | null };
    user?: { fullName?: string | null; name?: string | null; avatar?: string | null; avatarUrl?: string | null };
  };
  booking?: {
    id?: string;
    code?: string;
    status?: string;
    appointmentStart?: string;
    service?: { name?: string };
    pet?: { name?: string };
  };
  lastMessage?: string | ProviderChatMessageApi | null;
  messages?: ProviderChatMessageApi[];
};
export type ProviderChatMessageApi = {
  id: string;
  threadId?: string;
  senderId?: string;
  senderRole?: string;
  senderName?: string | null;
  senderFullName?: string | null;
  senderAvatar?: string | null;
  senderAvatarUrl?: string | null;
  sender?: {
    fullName?: string | null;
    name?: string | null;
    avatar?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  user?: {
    fullName?: string | null;
    name?: string | null;
    avatar?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  content?: string | null;
  message?: string | null;
  text?: string | null;
  createdAt?: string;
  createAt?: string;
  readAt?: string | null;
};
