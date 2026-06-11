# FEATURE MAPPING

## AUTH

Route Group:

(auth)

Features:

- Login
- Forgot Password
- Reset Password
- Register Provider

Folder:

features/auth

---

## PROVIDER

### SP-01 Business Profile

Route:

provider/business-profile

Feature:

features/provider/business-profile

Components:

- business-profile-form
- business-hours-form
- business-gallery

---

### SP-02 Services

Route:

provider/services

Feature:

features/provider/services

Components:

- service-form
- service-table
- service-action-menu

---

### SP-03 Pricing

Route:

provider/pricing

Components:

- price-list-table
- promotion-form
- combo-form

---

### SP-04 Bookings

Route:

provider/bookings

Components:

- booking-table
- booking-calendar
- booking-detail
- booking-status-actions

Workflow:

PENDING
→ CONFIRMED
→ IN_PROGRESS
→ COMPLETED

Alternative:

PENDING
→ CANCELLED

CONFIRMED
→ CANCELLED

---

### SP-05 Customers

Route:

provider/customers

Components:

- customer-table
- customer-detail
- pet-list
- service-history

---

### SP-06 Revenue

Route:

provider/revenue

Components:

- revenue-summary-cards
- revenue-chart
- popular-service-chart
- cancellation-rate-card

---

### SP-07 Communication

Routes:

provider/communication/chat

provider/communication/notifications

provider/communication/reviews

Components:

- chat-window
- message-list
- notification-form
- review-reply-box

---

## ADMIN

### Users

Route:

admin/users

Components:

- user-table
- user-detail
- user-status-actions

---

### Verification

Route:

admin/verification

Components:

- verification-table
- provider-document-viewer
- verification-actions

---

### Moderation

Route:

admin/moderation

Components:

- moderation-table
- report-table
- report-resolution-dialog

---

### Analytics

Route:

admin/analytics

Components:

- platform-summary-cards
- booking-analytics-chart
- platform-revenue-chart
- top-services-table
- top-providers-table
