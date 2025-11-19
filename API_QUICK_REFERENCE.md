# 🚀 MarifetBul Backend - Quick Reference Cheat Sheet

**Hızlı Erişim Kılavuzu** | **Son Güncelleme:** 17 Kasım 2025

---

## 📍 BASE URLs

```
Production:  https://api.marifetbul.com
Staging:     https://staging-api.marifetbul.com
Local:       http://localhost:8080
```

---

## 🔑 Authentication

### Login

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "requiresTwoFactor": false
}
```

### Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## 💰 Payment Flow (Quick)

### 1. Create Order

```bash
POST /api/v1/orders/package
{
  "packageId": "uuid",
  "paymentMode": "ONLINE",  # or "MANUAL"
  "amount": 1000.00
}
```

### 2. Create Payment Intent (if ONLINE)

```bash
POST /api/v1/payments/intent
{
  "orderId": "uuid",
  "amount": 1000.00
}
```

### 3. Confirm Payment

```bash
POST /api/v1/payments/confirm
{
  "paymentIntentId": "uuid"
}
```

### 4. Manual Payment (if MANUAL)

```bash
PUT /api/v1/orders/{orderId}/mark-payment-sent
{
  "paymentReference": "IBAN-REF-123",
  "senderIban": "TR000000000000000000000000"
}

# Seller confirms
PUT /api/v1/orders/{orderId}/confirm-manual-payment
{
  "paymentReference": "IBAN-REF-123"
}
```

---

## 📦 Order Lifecycle (Quick)

```
POST   /api/v1/orders/package        → Create
PUT    /api/v1/orders/{id}/accept    → Accept (Seller)
PUT    /api/v1/orders/{id}/start     → Start Work
PUT    /api/v1/orders/{id}/deliver   → Deliver
PUT    /api/v1/orders/{id}/approve   → Approve (Buyer)
```

---

## 💳 Wallet Operations (Quick)

```bash
# Get Balance
GET /api/v1/wallet/balance

# Get Transactions
GET /api/v1/wallet/transactions?page=0&size=20

# Request Payout
POST /api/v1/payouts/request
{
  "amount": 500.00,
  "bankAccountId": "uuid"
}

# Check Payout Status
GET /api/v1/payouts/{id}
```

---

## 🛡️ Admin Quick Actions

### Refund Management

```bash
# Approve Refund
PATCH /api/v1/refunds/{id}/approve
{
  "notes": "Approved due to..."
}

# Bulk Approve
POST /api/v1/refunds/bulk-approve
{
  "refundIds": ["uuid1", "uuid2"],
  "notes": "Bulk approval"
}
```

### User Management

```bash
# Suspend User
POST /api/v1/admin/users/{id}/suspend
{
  "suspensionType": "TEMPORARY",  # or "PERMANENT"
  "durationDays": 7,
  "reason": "Violation of terms"
}

# Ban User
POST /api/v1/admin/users/{id}/ban
{
  "reason": "Serious violation"
}
```

### Payout Processing

```bash
# Process Single Payout
POST /api/v1/payouts/admin/process/{id}

# Batch Process
POST /api/v1/payouts/admin/process-batch
{
  "limit": 50
}
```

---

## 🛡️ Moderation Quick Actions

```bash
# Get Queue
GET /api/v1/moderation/queue?page=0&size=20&type=REVIEW

# Approve Review
POST /api/v1/moderation/reviews/{id}/approve

# Reject Comment
POST /api/v1/moderation/comments/{id}/reject
{
  "reason": "Spam",
  "notes": "Promotional content"
}

# Bulk Approve Reviews
POST /api/v1/moderation/reviews/bulk/approve
{
  "itemIds": ["uuid1", "uuid2"]
}

# Escalate to Admin (Moderator only)
POST /api/v1/moderation/reviews/{id}/escalate
{
  "reason": "Requires admin decision"
}
```

---

## 🔔 Notification Quick Actions

```bash
# Get Notifications
GET /api/v1/notifications?page=0&size=20

# Get Unread Count
GET /api/v1/notifications/unread-count

# Mark as Read
PUT /api/v1/notifications/{id}/read

# Mark All as Read
PUT /api/v1/notifications/mark-all-read
```

---

## 💬 Message Quick Actions

```bash
# Send Message
POST /api/v1/messages
{
  "recipientId": "uuid",
  "content": "Hello!",
  "relatedEntityType": "JOB",  # optional
  "relatedEntityId": "uuid"     # optional
}

# Upload Attachment (First)
POST /api/v1/messages/attachments
Content-Type: multipart/form-data
files: [file1, file2]  # Max 3, 10MB each

Response: [{ "id": "uuid", "url": "...", "type": "IMAGE" }]

# Send with Attachment
POST /api/v1/messages
{
  "recipientId": "uuid",
  "content": "Check this out",
  "attachmentIds": ["uuid1", "uuid2"]
}

# Get Unread Count
GET /api/v1/messages/unread-count
```

---

## 📊 Reports (Admin)

```bash
# Generate Report
POST /api/v1/admin/reports/generate
{
  "reportType": "REVENUE",  # REVENUE, ORDERS, USERS, REFUNDS
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-11-01T00:00:00Z",
  "groupBy": "DAY"  # DAY, WEEK, MONTH
}

# Export to CSV
GET /api/v1/admin/reports/export/csv?reportType=REVENUE&startDate=2025-01-01&endDate=2025-01-31&groupBy=DAILY

# Export to PDF (NEW - Sprint 1)
GET /api/v1/admin/reports/export/pdf?reportType=REVENUE&startDate=2025-01-01&endDate=2025-01-31&groupBy=DAILY

# PDF Export Features:
# ✅ Professional MarifetBul branding
# ✅ Turkish language support (Türkçe karakterler)
# ✅ Summary statistics (Toplam, Ortalama, Min/Max, Trend)
# ✅ Detailed data tables with proper formatting
# ✅ Generation metadata footer
# ✅ iText 8.0.5 for high-quality PDF output

# Report Types:
# - REVENUE: Gelir raporu (revenue, orderCount, averageOrderValue)
# - ORDERS: Sipariş raporu (totalOrders, completedOrders, cancelledOrders, completionRate)
# - USERS: Kullanıcı raporu (newUsers, activeUsers)
# - REFUNDS: İade raporu (refundAmount, refundCount, averageRefund)

# Group By Options:
# - DAILY: Günlük gruplama
# - WEEKLY: Haftalık gruplama
# - MONTHLY: Aylık gruplama

# Response: Binary PDF file
# Content-Type: application/pdf
# Content-Disposition: attachment; filename="{reportType}_Report_{startDate}_{endDate}.pdf"
```

---

## 🔍 Search & Filter Examples

### Order Filtering

```bash
GET /api/v1/orders/filter?
  buyerId=uuid&
  statuses=PAID,IN_PROGRESS&
  minAmount=100&
  maxAmount=5000&
  startDate=2025-10-01T00:00:00Z&
  endDate=2025-11-01T00:00:00Z&
  page=0&
  size=20
```

### Enhanced Order Search

```bash
GET /api/v1/orders/search/enhanced?
  query=web+design&
  page=0&
  size=20
```

### Transaction Filtering

```bash
GET /api/v1/wallet/transactions/filtered?
  type=CREDIT&
  startDate=2025-10-01T00:00:00Z&
  endDate=2025-11-01T00:00:00Z&
  minAmount=100&
  page=0&
  size=20
```

---

## 🎯 Common HTTP Status Codes

```
200 OK                  → Success
201 Created             → Resource created
204 No Content          → Success (no response body)
400 Bad Request         → Validation error
401 Unauthorized        → Authentication required
403 Forbidden           → Insufficient permissions
404 Not Found           → Resource not found
409 Conflict            → Business logic conflict
422 Unprocessable       → Payment failed, insufficient balance
429 Too Many Requests   → Rate limit exceeded
500 Internal Error      → Server error
501 Not Implemented     → Feature not available (PDF export)
```

---

## 🚨 Error Response Format

```json
{
  "success": false,
  "message": "Insufficient balance",
  "errors": [
    {
      "field": "amount",
      "message": "Amount exceeds available balance"
    }
  ],
  "timestamp": "2025-11-17T10:30:00Z"
}
```

---

## ⚡ Rate Limits

```
Messages:    50 / minute / user
API Calls:   1000 / hour / user
File Upload: 3 files, 10MB each
```

---

## 🔐 Role Permissions Quick Reference

| Endpoint                                      | PUBLIC | BUYER | SELLER | MODERATOR | ADMIN |
| --------------------------------------------- | ------ | ----- | ------ | --------- | ----- |
| GET /api/v1/packages                          | ✅     | ✅    | ✅     | ✅        | ✅    |
| POST /api/v1/orders                           | ❌     | ✅    | ✅     | ❌        | ✅    |
| POST /api/v1/payments                         | ❌     | ✅    | ✅     | ❌        | ✅    |
| GET /api/v1/wallet                            | ❌     | ✅    | ✅     | ❌        | ✅    |
| POST /api/v1/payouts/request                  | ❌     | ❌    | ✅     | ❌        | ✅    |
| POST /api/v1/refunds/{id}/approve             | ❌     | ❌    | ❌     | ✅        | ✅    |
| POST /api/v1/moderation/reviews/{id}/approve  | ❌     | ❌    | ❌     | ✅        | ✅    |
| POST /api/v1/moderation/reviews/{id}/escalate | ❌     | ❌    | ❌     | ✅        | ❌    |
| POST /api/v1/admin/users/{id}/ban             | ❌     | ❌    | ❌     | ❌        | ✅    |
| POST /api/v1/wallet/admin/{id}/freeze         | ❌     | ❌    | ❌     | ❌        | ✅    |

---

## 🔧 Troubleshooting Quick Fixes

### "Insufficient balance"

```bash
# Check balance first
GET /api/v1/wallet/balance

# Check pending payouts
GET /api/v1/payouts/my-payouts?status=PENDING
```

### "Payment already processed"

```bash
# Check payment status
GET /api/v1/payments/{id}

# Check order status
GET /api/v1/orders/{orderId}
```

### "Refund already requested"

```bash
# Check existing refunds
GET /api/v1/refunds/orders/{orderId}
```

### "Invalid webhook signature"

```bash
# Verify webhook configuration
# Check Iyzico signature secret
# Validate payload format
```

---

## 📦 Pagination Format

```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "pageNumber": 0,
  "pageSize": 20,
  "hasNext": true,
  "hasPrevious": false
}
```

---

## 🎯 Important Notes

⚠️ **PDF Export:** Not implemented yet (use CSV)  
✅ **Dual Payment:** Both Iyzico and IBAN supported  
✅ **Auto-Release:** 14 days → 24h warning → auto-complete  
✅ **2FA:** Supported but optional  
✅ **WebSocket:** Real-time messaging on `/ws`

---

## 📞 Support

- **Documentation:** `/swagger-ui.html`
- **Health Check:** `/actuator/health`
- **Metrics:** `/actuator/metrics` (Admin only)

---

**💡 Pro Tip:** Her zaman Swagger UI'ı kullanarak API'yi test edebilirsiniz: `/swagger-ui.html`
