petlink-web/
│
├── public/
│   ├── images/
│   │   ├── landing/
│   │   ├── providers/
│   │   └── placeholders/
│   ├── icons/
│   └── logo.svg
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── error.tsx
│   │
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   └── providers/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register-provider/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   └── (dashboard)/
│       ├── layout.tsx
│       │
│       ├── provider/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── business-profile/
│       │   │   └── page.tsx
│       │   ├── services/
│       │   │   ├── page.tsx
│       │   │   ├── create/
│       │   │   │   └── page.tsx
│       │   │   └── [serviceId]/
│       │   │       └── edit/
│       │   │           └── page.tsx
│       │   ├── pricing/
│       │   │   ├── page.tsx
│       │   │   ├── promotions/
│       │   │   │   └── page.tsx
│       │   │   └── combos/
│       │   │       └── page.tsx
│       │   ├── bookings/
│       │   │   ├── page.tsx
│       │   │   └── [bookingId]/
│       │   │       └── page.tsx
│       │   ├── customers/
│       │   │   ├── page.tsx
│       │   │   └── [customerId]/
│       │   │       └── page.tsx
│       │   ├── revenue/
│       │   │   └── page.tsx
│       │   └── communication/
│       │       ├── chat/
│       │       │   └── page.tsx
│       │       ├── notifications/
│       │       │   └── page.tsx
│       │       └── reviews/
│       │           └── page.tsx
│       │
│       └── admin/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── users/
│           │   ├── page.tsx
│           │   └── [userId]/
│           │       └── page.tsx
│           ├── providers/
│           │   ├── page.tsx
│           │   └── [providerId]/
│           │       └── page.tsx
│           ├── verification/
│           │   ├── page.tsx
│           │   └── [verificationId]/
│           │       └── page.tsx
│           ├── moderation/
│           │   ├── page.tsx
│           │   ├── reports/
│           │   │   └── page.tsx
│           │   └── services/
│           │       └── page.tsx
│           ├── bookings/
│           │   ├── page.tsx
│           │   └── disputes/
│           │       └── page.tsx
│           └── analytics/
│               └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── landing/
│   ├── common/
│   └── guards/
│
├── features/
│   ├── auth/
│   │   ├── queries.ts
│   │   ├── schema.ts
│   │   └── components/
│   │       ├── login-form.tsx
│   │       ├── register-provider-form.tsx
│   │       └── forgot-password-form.tsx
│   │
│   ├── provider/
│   │   ├── business-profile/
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── components/
│   │   │       ├── business-profile-form.tsx
│   │   │       ├── business-hours-form.tsx
│   │   │       └── business-gallery.tsx
│   │   ├── services/
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── components/
│   │   │       ├── service-form.tsx
│   │   │       ├── service-table.tsx
│   │   │       ├── service-category-select.tsx
│   │   │       └── service-action-menu.tsx
│   │   ├── pricing/
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── components/
│   │   │       ├── price-list-table.tsx
│   │   │       ├── promotion-form.tsx
│   │   │       └── combo-form.tsx
│   │   ├── bookings/
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── components/
│   │   │       ├── booking-table.tsx
│   │   │       ├── booking-calendar.tsx
│   │   │       ├── booking-detail.tsx
│   │   │       └── booking-status-actions.tsx
│   │   ├── customers/
│   │   │   ├── queries.ts
│   │   │   └── components/
│   │   │       ├── customer-table.tsx
│   │   │       ├── customer-detail.tsx
│   │   │       ├── pet-list.tsx
│   │   │       └── service-history.tsx
│   │   ├── revenue/
│   │   │   ├── queries.ts
│   │   │   └── components/
│   │   │       ├── revenue-summary-cards.tsx
│   │   │       ├── revenue-chart.tsx
│   │   │       ├── popular-service-chart.tsx
│   │   │       └── cancellation-rate-card.tsx
│   │   └── communication/
│   │       ├── queries.ts
│   │       ├── schema.ts
│   │       └── components/
│   │           ├── chat-window.tsx
│   │           ├── message-list.tsx
│   │           ├── notification-form.tsx
│   │           └── review-reply-box.tsx
│   │
│   └── admin/
│       ├── users/
│       │   ├── queries.ts
│       │   └── components/
│       │       ├── user-table.tsx
│       │       ├── user-detail.tsx
│       │       └── user-status-actions.tsx
│       ├── verification/
│       │   ├── queries.ts
│       │   ├── schema.ts
│       │   └── components/
│       │       ├── verification-table.tsx
│       │       ├── provider-document-viewer.tsx
│       │       └── verification-actions.tsx
│       ├── moderation/
│       │   ├── queries.ts
│       │   ├── schema.ts
│       │   └── components/
│       │       ├── moderation-table.tsx
│       │       ├── report-table.tsx
│       │       └── report-resolution-dialog.tsx
│       ├── bookings/
│       │   ├── queries.ts
│       │   ├── schema.ts
│       │   └── components/
│       │       ├── system-booking-table.tsx
│       │       ├── dispute-table.tsx
│       │       └── dispute-resolution-form.tsx
│       └── analytics/
│           ├── queries.ts
│           └── components/
│               ├── platform-summary-cards.tsx
│               ├── booking-analytics-chart.tsx
│               ├── platform-revenue-chart.tsx
│               ├── top-services-table.tsx
│               └── top-providers-table.tsx
│
├── lib/
│   ├── axios.ts
│   ├── query-client.ts
│   ├── auth.ts
│   ├── rbac.ts
│   ├── routes.ts
│   ├── permissions.ts
│   ├── upload-adapter.ts
│   ├── date.ts
│   ├── currency.ts
│   └── utils.ts
│
├── stores/
│   ├── auth-store.ts
│   ├── ui-store.ts
│   ├── provider-store.ts
│   └── filter-store.ts
│
├── hooks/
│   ├── use-debounce.ts
│   ├── use-pagination.ts
│   ├── use-permission.ts
│   ├── use-upload.ts
│   └── use-toast.ts
│
├── constants/
│   ├── roles.ts
│   ├── permissions.ts
│   ├── booking-status.ts
│   ├── service-category.ts
│   ├── query-keys.ts
│   └── api-endpoints.ts
│
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── provider.ts
│   ├── service.ts
│   ├── booking.ts
│   ├── customer.ts
│   ├── pet.ts
│   ├── review.ts
│   ├── revenue.ts
│   ├── analytics.ts
│   ├── api.ts
│   └── common.ts
│
├── providers/
│   ├── app-provider.tsx
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   └── auth-provider.tsx