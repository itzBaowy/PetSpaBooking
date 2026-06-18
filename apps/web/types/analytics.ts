export interface AnalyticsMetrics {
  totalBookings: number;
  totalRevenue: number;
  activeProviders: number;
  totalUsers: number;
  averageBookingValue: number;
}

export interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}
