# ORDER & PAYMENT CHECKOUT - API DOCUMENTATION

## Overview

This document provides comprehensive API documentation for the Order & Payment Checkout system. It covers all endpoints, request/response formats, error handling, and integration examples.

**Base URL (Production)**: `https://api.marifetbul.com`  
**Base URL (Development)**: `http://localhost:8080`  
**API Version**: `v1`

---

## Authentication

All API endpoints require authentication via JWT token.

### Getting a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600
}
```

### Using Token

Include token in all requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Order Endpoints

### 1. Create Order

Creates a new order from a package purchase.

```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "packageId": 123,
  "sellerId": 456,
  "requirements": "Project requirements and details here",
  "additionalNotes": "Any additional notes (optional)",
  "attachments": ["https://cdn.example.com/file1.pdf"]
}
```

**Response (201 Created):**

```json
{
  "id": 789,
  "packageId": 123,
  "buyerId": 101,
  "sellerId": 456,
  "status": "PENDING_PAYMENT",
  "amount": 50000,
  "platformFee": 7500,
  "totalAmount": 57500,
  "currency": "TRY",
  "deliveryDate": "2025-11-01T00:00:00Z",
  "requirements": "Project requirements and details here",
  "additionalNotes": "Any additional notes",
  "attachments": ["https://cdn.example.com/file1.pdf"],
  "createdAt": "2025-10-25T10:30:00Z",
  "updatedAt": "2025-10-25T10:30:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid package ID or seller ID
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Package or seller not found
- `422 Unprocessable Entity`: Validation errors

---

### 2. Get Order Details

Retrieves detailed information about an order.

```http
GET /api/v1/orders/{orderId}
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "id": 789,
  "packageId": 123,
  "packageTitle": "Premium Logo Design",
  "buyerId": 101,
  "buyerName": "John Doe",
  "buyerAvatar": "https://cdn.example.com/avatar.jpg",
  "sellerId": 456,
  "sellerName": "Jane Designer",
  "sellerAvatar": "https://cdn.example.com/seller.jpg",
  "status": "IN_PROGRESS",
  "amount": 50000,
  "platformFee": 7500,
  "totalAmount": 57500,
  "currency": "TRY",
  "deliveryDate": "2025-11-01T00:00:00Z",
  "requirements": "Project requirements",
  "additionalNotes": "Notes",
  "attachments": ["https://cdn.example.com/file1.pdf"],
  "deliveryFiles": [],
  "deliveryNote": null,
  "deliveredAt": null,
  "completedAt": null,
  "escrowStatus": "HELD",
  "escrowAmount": 50000,
  "timeline": [
    {
      "id": 1,
      "status": "PENDING_PAYMENT",
      "actor": "John Doe",
      "actorType": "BUYER",
      "description": "Sipariş oluşturuldu",
      "createdAt": "2025-10-25T10:30:00Z"
    },
    {
      "id": 2,
      "status": "PAID",
      "actor": "System",
      "actorType": "SYSTEM",
      "description": "Ödeme başarıyla alındı",
      "createdAt": "2025-10-25T10:35:00Z"
    }
  ],
  "createdAt": "2025-10-25T10:30:00Z",
  "updatedAt": "2025-10-25T10:35:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this order
- `404 Not Found`: Order not found

---

### 3. List Orders

Retrieves a paginated list of orders for the authenticated user.

```http
GET /api/v1/orders?page=0&size=20&status=IN_PROGRESS&role=BUYER
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (int, optional): Page number (0-indexed, default: 0)
- `size` (int, optional): Items per page (default: 20, max: 100)
- `status` (string, optional): Filter by status
  - Values: `PENDING_PAYMENT`, `PAID`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `DISPUTED`
- `role` (string, optional): Filter by user role
  - Values: `BUYER`, `SELLER`

**Response (200 OK):**

```json
{
  "content": [
    {
      "id": 789,
      "packageTitle": "Premium Logo Design",
      "sellerName": "Jane Designer",
      "status": "IN_PROGRESS",
      "amount": 50000,
      "currency": "TRY",
      "deliveryDate": "2025-11-01T00:00:00Z",
      "createdAt": "2025-10-25T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

### 4. Update Order Status

Updates the status of an order (for sellers and admins).

```http
PATCH /api/v1/orders/{orderId}/status
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "status": "IN_PROGRESS",
  "note": "Started working on your project"
}
```

**Valid Status Transitions:**

- `PAID` → `IN_PROGRESS` (Seller starts work)
- `IN_PROGRESS` → `DELIVERED` (Seller delivers)
- `DELIVERED` → `COMPLETED` (Buyer accepts)
- `DELIVERED` → `IN_PROGRESS` (Buyer requests revision)
- Any → `CANCELLED` (Admin only)
- Any → `DISPUTED` (Buyer/Seller can dispute)

**Response (200 OK):**

```json
{
  "id": 789,
  "status": "IN_PROGRESS",
  "updatedAt": "2025-10-25T11:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Invalid status transition
- `403 Forbidden`: Not authorized to update status
- `404 Not Found`: Order not found

---

### 5. Deliver Order

Seller submits delivery files and completes the order.

```http
POST /api/v1/orders/{orderId}/deliver
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "deliveryNote": "I've completed your logo design. Please review the files.",
  "deliveryFiles": [
    "https://cdn.example.com/logo-final.ai",
    "https://cdn.example.com/logo-preview.png"
  ]
}
```

**Response (200 OK):**

```json
{
  "id": 789,
  "status": "DELIVERED",
  "deliveryNote": "I've completed your logo design...",
  "deliveryFiles": [
    "https://cdn.example.com/logo-final.ai",
    "https://cdn.example.com/logo-preview.png"
  ],
  "deliveredAt": "2025-10-30T14:00:00Z"
}
```

---

### 6. Accept Delivery

Buyer accepts the delivered work and releases escrow.

```http
POST /api/v1/orders/{orderId}/accept
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "rating": 5,
  "review": "Excellent work, highly recommended!",
  "tip": 5000
}
```

**Response (200 OK):**

```json
{
  "id": 789,
  "status": "COMPLETED",
  "escrowStatus": "RELEASED",
  "completedAt": "2025-10-30T15:00:00Z"
}
```

---

### 7. Request Revision

Buyer requests changes to delivered work.

```http
POST /api/v1/orders/{orderId}/revision
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "revisionNote": "Please change the logo color to blue and adjust the font size.",
  "attachments": ["https://cdn.example.com/reference.jpg"]
}
```

**Response (200 OK):**

```json
{
  "id": 789,
  "status": "IN_PROGRESS",
  "revisionCount": 1,
  "revisionNote": "Please change the logo color to blue...",
  "updatedAt": "2025-10-30T16:00:00Z"
}
```

**Errors:**

- `400 Bad Request`: Revision limit exceeded
- `403 Forbidden`: Cannot request revision in current status

---

## Payment Endpoints

### 1. Create Payment Intent

Creates a Stripe Payment Intent for an order.

```http
POST /api/v1/payments/intent
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "orderId": 789,
  "amount": 57500,
  "currency": "TRY"
}
```

**Response (200 OK):**

```json
{
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_yyyyyyyyyyy",
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "amount": 57500,
  "currency": "try",
  "status": "requires_payment_method",
  "metadata": {
    "orderId": "789",
    "userId": "101"
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid order ID or amount
- `402 Payment Required`: Previous payment pending
- `404 Not Found`: Order not found

---

### 2. Confirm Payment

Confirms payment completion and updates order status.

```http
POST /api/v1/payments/confirm
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "orderId": 789
}
```

**Response (200 OK):**

```json
{
  "id": 1001,
  "orderId": 789,
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "amount": 57500,
  "currency": "TRY",
  "status": "COMPLETED",
  "transactionType": "PAYMENT",
  "paymentMethod": "card",
  "cardLast4": "4242",
  "cardBrand": "visa",
  "createdAt": "2025-10-25T10:35:00Z"
}
```

---

### 3. Get Payment History

Retrieves payment history for an order.

```http
GET /api/v1/payments/order/{orderId}
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "payments": [
    {
      "id": 1001,
      "amount": 57500,
      "currency": "TRY",
      "status": "COMPLETED",
      "transactionType": "PAYMENT",
      "paymentMethod": "card",
      "cardLast4": "4242",
      "cardBrand": "visa",
      "createdAt": "2025-10-25T10:35:00Z"
    }
  ],
  "totalPaid": 57500,
  "totalRefunded": 0,
  "escrowAmount": 50000,
  "escrowStatus": "HELD"
}
```

---

### 4. Request Refund

Requests a full or partial refund for a payment.

```http
POST /api/v1/payments/refund/request
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "paymentId": 1001,
  "amount": 57500,
  "reason": "Seller did not deliver as promised",
  "refundType": "FULL"
}
```

**Parameters:**

- `paymentId` (int, required): Payment ID
- `amount` (int, optional): Refund amount in cents (required for partial refund)
- `reason` (string, required): Reason for refund (min 10 chars)
- `refundType` (string, required): `FULL` or `PARTIAL`

**Response (200 OK):**

```json
{
  "refundRequestId": 5001,
  "status": "PENDING",
  "amount": 57500,
  "reason": "Seller did not deliver as promised",
  "requestedAt": "2025-10-30T17:00:00Z",
  "estimatedProcessingDays": 14
}
```

**Errors:**

- `400 Bad Request`: Invalid refund request
- `403 Forbidden`: Refund not allowed for this payment
- `404 Not Found`: Payment not found

---

### 5. Process Refund (Admin)

Admin endpoint to approve/reject refund requests.

```http
POST /api/v1/payments/refund/process
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "refundRequestId": 5001,
  "action": "APPROVE",
  "adminNote": "Refund approved due to non-delivery"
}
```

**Parameters:**

- `action`: `APPROVE` or `REJECT`
- `adminNote`: Admin notes (optional)

**Response (200 OK):**

```json
{
  "refundId": 6001,
  "status": "PROCESSING",
  "amount": 57500,
  "stripeRefundId": "re_xxxxxxxxxxxxx",
  "estimatedArrival": "2025-11-13T00:00:00Z"
}
```

---

### 6. Get Refund Status

Check the status of a refund request.

```http
GET /api/v1/payments/refund/{refundRequestId}
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "id": 5001,
  "paymentId": 1001,
  "orderId": 789,
  "amount": 57500,
  "reason": "Seller did not deliver as promised",
  "status": "APPROVED",
  "refundId": 6001,
  "stripeRefundId": "re_xxxxxxxxxxxxx",
  "requestedAt": "2025-10-30T17:00:00Z",
  "processedAt": "2025-10-31T10:00:00Z",
  "estimatedArrival": "2025-11-13T00:00:00Z"
}
```

**Refund Statuses:**

- `PENDING`: Awaiting admin review
- `APPROVED`: Approved, processing refund
- `REJECTED`: Rejected by admin
- `COMPLETED`: Refund completed
- `FAILED`: Refund failed

---

## Webhook Endpoints

### Stripe Webhook Handler

Receives and processes Stripe webhook events.

```http
POST /api/v1/webhooks/stripe
Content-Type: application/json
Stripe-Signature: {signature}
```

**Events Handled:**

- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_intent.canceled`: Payment canceled
- `charge.refunded`: Refund processed
- `charge.dispute.created`: Chargeback initiated

**Response (200 OK):**

```json
{
  "received": true
}
```

**Important**:

- Must verify `Stripe-Signature` header
- Return 200 quickly (< 5 seconds)
- Process events asynchronously

---

## Error Responses

All API errors follow this format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid or cannot be served",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be at least 5000 (₺50)"
      }
    ],
    "timestamp": "2025-10-25T10:30:00Z",
    "path": "/api/v1/payments/intent"
  }
}
```

### HTTP Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created                                  |
| 400  | Bad Request - Invalid input              |
| 401  | Unauthorized - Missing/invalid token     |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource doesn't exist       |
| 422  | Unprocessable Entity - Validation failed |
| 429  | Too Many Requests - Rate limit exceeded  |
| 500  | Internal Server Error                    |
| 502  | Bad Gateway - External service error     |
| 503  | Service Unavailable - Maintenance        |

### Error Codes

| Code                      | Description                   |
| ------------------------- | ----------------------------- |
| `INVALID_REQUEST`         | Request validation failed     |
| `AUTHENTICATION_REQUIRED` | Must be authenticated         |
| `AUTHORIZATION_FAILED`    | Insufficient permissions      |
| `RESOURCE_NOT_FOUND`      | Resource not found            |
| `DUPLICATE_RESOURCE`      | Resource already exists       |
| `PAYMENT_FAILED`          | Payment processing failed     |
| `REFUND_FAILED`           | Refund processing failed      |
| `RATE_LIMIT_EXCEEDED`     | Too many requests             |
| `EXTERNAL_SERVICE_ERROR`  | Stripe or other service error |
| `INTERNAL_ERROR`          | Unexpected server error       |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

**Limits:**

- **General**: 100 requests/minute per IP
- **Payment**: 5 requests/minute per user
- **Refund**: 3 requests/hour per user

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635174000
```

**429 Response:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds",
    "retryAfter": 45
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// API Client Setup
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.marifetbul.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create Order
async function createOrder(packageId: number, sellerId: number, requirements: string) {
  const response = await apiClient.post('/orders', {
    packageId,
    sellerId,
    requirements,
  });
  return response.data;
}

// Create Payment Intent
async function createPaymentIntent(orderId: number, amount: number) {
  const response = await apiClient.post('/payments/intent', {
    orderId,
    amount,
    currency: 'TRY',
  });
  return response.data;
}

// Process Payment with Stripe
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_live_xxxxx');

async function processPayment(clientSecret: string) {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement, // Stripe CardElement
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Confirm payment on backend
  await apiClient.post('/payments/confirm', {
    paymentIntentId: paymentIntent.id,
    orderId: order.id,
  });

  return paymentIntent;
}

// Request Refund
async function requestRefund(paymentId: number, reason: string) {
  const response = await apiClient.post('/payments/refund/request', {
    paymentId,
    refundType: 'FULL',
    reason,
  });
  return response.data;
}
```

### Java (Spring RestTemplate)

```java
@Service
public class OrderService {

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_BASE_URL = "https://api.marifetbul.com/api/v1";

    public Order createOrder(CreateOrderRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(getAuthToken());

        HttpEntity<CreateOrderRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Order> response = restTemplate.postForEntity(
            API_BASE_URL + "/orders",
            entity,
            Order.class
        );

        return response.getBody();
    }

    public PaymentIntent createPaymentIntent(Long orderId, Integer amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(getAuthToken());

        Map<String, Object> request = Map.of(
            "orderId", orderId,
            "amount", amount,
            "currency", "TRY"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<PaymentIntent> response = restTemplate.postForEntity(
            API_BASE_URL + "/payments/intent",
            entity,
            PaymentIntent.class
        );

        return response.getBody();
    }
}
```

### Python (requests)

```python
import requests

API_BASE_URL = "https://api.marifetbul.com/api/v1"

class OrderAPI:
    def __init__(self, token):
        self.token = token
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

    def create_order(self, package_id, seller_id, requirements):
        response = requests.post(
            f"{API_BASE_URL}/orders",
            headers=self.headers,
            json={
                "packageId": package_id,
                "sellerId": seller_id,
                "requirements": requirements
            }
        )
        response.raise_for_status()
        return response.json()

    def create_payment_intent(self, order_id, amount):
        response = requests.post(
            f"{API_BASE_URL}/payments/intent",
            headers=self.headers,
            json={
                "orderId": order_id,
                "amount": amount,
                "currency": "TRY"
            }
        )
        response.raise_for_status()
        return response.json()

    def request_refund(self, payment_id, reason):
        response = requests.post(
            f"{API_BASE_URL}/payments/refund/request",
            headers=self.headers,
            json={
                "paymentId": payment_id,
                "refundType": "FULL",
                "reason": reason
            }
        )
        response.raise_for_status()
        return response.json()

# Usage
api = OrderAPI(token="your_token_here")
order = api.create_order(123, 456, "Logo design requirements")
payment_intent = api.create_payment_intent(order["id"], 57500)
```

---

## Testing

### Test Environment

**Base URL**: `https://api-staging.marifetbul.com`

**Test Credentials:**

```
Buyer Account:
Email: buyer@test.marifetbul.com
Password: Test123!

Seller Account:
Email: seller@test.marifetbul.com
Password: Test123!
```

### Stripe Test Cards

```
Success:
4242 4242 4242 4242 (any CVC, any future date)

3D Secure Required:
4000 0027 6000 3184

Declined:
4000 0000 0000 0002

Insufficient Funds:
4000 0000 0000 9995
```

### Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Marifetbul Order & Payment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"buyer@test.marifetbul.com\",\n  \"password\": \"Test123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Orders",
      "item": [
        {
          "name": "Create Order",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"packageId\": 123,\n  \"sellerId\": 456,\n  \"requirements\": \"Logo design requirements\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/orders",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "orders"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api-staging.marifetbul.com"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Versioning

API versioning is handled via URL path:

- **Current**: `/api/v1/*`
- **Future**: `/api/v2/*` (when released)

**Breaking Changes**: Major version bump (v1 → v2)
**Non-Breaking Changes**: Same version, documented in changelog

---

## Support

**Developer Support:**

- Email: api-support@marifetbul.com
- Discord: https://discord.gg/marifetbul
- Documentation: https://docs.marifetbul.com

**Report Issues:**

- GitHub: https://github.com/marifetbul/issues
- Response Time: 24-48 hours

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0  
**API Version**: v1
