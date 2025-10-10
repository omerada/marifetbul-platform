# API Tasarımı - RESTful Endpoints

> **Dokümantasyon**: 04 - API Tasarımı  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 📋 API Genel Yapısı

### Base URL

```
Development: http://localhost:8080/api/v1
Production: https://api.marifetbul.com/api/v1
```

### Versioning Strategy

- URI versioning: `/api/v1/*`
- Header-based fallback: `API-Version: 1.0`

### Standard Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-10-10T12:00:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Job not found",
    "details": []
  },
  "timestamp": "2025-10-10T12:00:00Z"
}
```

**Paginated Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /api/v1/auth/register

**Kullanıcı Kaydı**

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "FREELANCER"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "FREELANCER"
    },
    "token": "eyJhbGciOiJIUzI1...",
    "refreshToken": "refresh_token",
    "expiresIn": 604800
  }
}
```

### POST /api/v1/auth/login

**Kullanıcı Girişi**

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response:** `200 OK`

### POST /api/v1/auth/refresh

**Token Yenileme**

**Request:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /api/v1/auth/logout

**Çıkış**

---

## 👤 User Endpoints

### GET /api/v1/users/{id}

**Kullanıcı Profili Getir**

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "userType": "FREELANCER",
    "rating": 4.8,
    "completedJobs": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/v1/users/{id}

**Profil Güncelle**

### GET /api/v1/users/me

**Mevcut Kullanıcı**

---

## 💼 Job Endpoints

### GET /api/v1/jobs

**İş İlanlarını Listele**

**Query Parameters:**

- `page` (default: 0)
- `size` (default: 20)
- `categoryId` (UUID)
- `skills` (comma-separated)
- `minBudget` (number)
- `maxBudget` (number)
- `experienceLevel` (BEGINNER|INTERMEDIATE|EXPERT)
- `isRemote` (boolean)
- `location` (string)
- `sort` (createdAt, budget, proposals)
- `order` (asc, desc)

**Example:** `/api/v1/jobs?categoryId=uuid&minBudget=1000&isRemote=true&page=0&size=20`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Web Development Project",
      "description": "Need a full-stack developer...",
      "category": {
        "id": "uuid",
        "name": "Web Development"
      },
      "skills": ["React", "Node.js", "PostgreSQL"],
      "budget": {
        "type": "FIXED",
        "amount": 5000,
        "currency": "TRY"
      },
      "status": "OPEN",
      "proposalsCount": 12,
      "employer": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatar": "https://...",
        "rating": 4.9
      },
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/v1/jobs

**İş İlanı Oluştur**

**Request:**

```json
{
  "title": "Web Development Project",
  "description": "Looking for experienced developer...",
  "categoryId": "uuid",
  "subcategory": "Full Stack",
  "skills": ["React", "Node.js"],
  "budget": {
    "type": "FIXED",
    "amount": 5000
  },
  "timeline": "1 month",
  "deadline": "2025-11-01T00:00:00Z",
  "experienceLevel": "INTERMEDIATE",
  "isRemote": true,
  "requirements": ["3+ years experience", "Portfolio required"],
  "tags": ["urgent", "long-term"]
}
```

**Response:** `201 Created`

### GET /api/v1/jobs/{id}

**İş Detayı**

### PUT /api/v1/jobs/{id}

**İş Güncelle**

### DELETE /api/v1/jobs/{id}

**İş Sil**

### POST /api/v1/jobs/{id}/close

**İlanı Kapat**

---

## 📦 Package Endpoints

### GET /api/v1/packages

**Paketleri Listele**

**Query Parameters:**

- `page`, `size`
- `categoryId`
- `freelancerId`
- `minPrice`, `maxPrice`
- `skills`
- `sort` (price, rating, orders)

### POST /api/v1/packages

**Paket Oluştur**

**Request:**

```json
{
  "title": "Professional Logo Design",
  "description": "I will create a unique logo...",
  "shortDescription": "Custom logo in 3 days",
  "categoryId": "uuid",
  "skills": ["Illustrator", "Photoshop"],
  "price": 500,
  "deliveryTime": 3,
  "revisions": 2,
  "features": ["Source files included", "Commercial use", "24/7 support"],
  "images": ["https://...", "https://..."],
  "tags": ["logo", "branding"]
}
```

### GET /api/v1/packages/{id}

**Paket Detayı**

### PUT /api/v1/packages/{id}

**Paket Güncelle**

### POST /api/v1/packages/{id}/pause

**Paketi Duraklat**

---

## 📝 Proposal Endpoints

### GET /api/v1/proposals

**Teklifleri Listele**

### POST /api/v1/proposals

**Teklif Ver**

**Request:**

```json
{
  "jobId": "uuid",
  "coverLetter": "I am interested in this project...",
  "proposedRate": 4500,
  "deliveryTime": 25,
  "attachments": []
}
```

### GET /api/v1/proposals/{id}

**Teklif Detayı**

### POST /api/v1/proposals/{id}/accept

**Teklifi Kabul Et** (Employer only)

### POST /api/v1/proposals/{id}/reject

**Teklifi Reddet**

### DELETE /api/v1/proposals/{id}

**Teklifi Çek**

---

## 🛒 Order Endpoints

### GET /api/v1/orders

**Siparişleri Listele**

**Query Parameters:**

- `status` (PENDING, IN_PROGRESS, COMPLETED, etc.)
- `userId` (employer or freelancer)
- `type` (job-based, package-based)

### POST /api/v1/orders

**Sipariş Oluştur**

**Request:**

```json
{
  "packageId": "uuid",
  "tier": "BASIC",
  "requirements": "Please use blue color scheme",
  "attachments": []
}
```

### GET /api/v1/orders/{id}

**Sipariş Detayı**

### POST /api/v1/orders/{id}/deliver

**Teslim Et** (Freelancer)

**Request:**

```json
{
  "deliverables": [
    { "name": "logo.ai", "url": "https://..." },
    { "name": "logo.png", "url": "https://..." }
  ],
  "notes": "Delivered as per requirements"
}
```

### POST /api/v1/orders/{id}/request-revision

**Revizyon İste** (Employer)

### POST /api/v1/orders/{id}/complete

**Onayla ve Tamamla**

### POST /api/v1/orders/{id}/cancel

**İptal Et**

---

## 💬 Messaging Endpoints

### GET /api/v1/conversations

**Konuşmaları Listele**

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "DIRECT",
      "participants": [
        {
          "userId": "uuid",
          "name": "John Doe",
          "avatar": "https://...",
          "isOnline": true
        }
      ],
      "lastMessage": {
        "id": "uuid",
        "content": "Thanks for your proposal",
        "sentAt": "2025-10-10T10:00:00Z"
      },
      "unreadCount": 3,
      "updatedAt": "2025-10-10T10:00:00Z"
    }
  ]
}
```

### POST /api/v1/conversations

**Yeni Konuşma Başlat**

### GET /api/v1/conversations/{id}/messages

**Mesajları Getir**

**Query Parameters:**

- `page`, `size`
- `before` (timestamp - older messages)
- `after` (timestamp - newer messages)

### POST /api/v1/conversations/{id}/messages

**Mesaj Gönder**

**Request:**

```json
{
  "content": "Hello, I'm interested in your proposal",
  "type": "TEXT",
  "attachments": [],
  "replyTo": "uuid"
}
```

### PUT /api/v1/messages/{id}

**Mesaj Düzenle**

### DELETE /api/v1/messages/{id}

**Mesaj Sil**

### POST /api/v1/messages/{id}/read

**Okundu İşaretle**

---

## 💳 Payment Endpoints

### POST /api/v1/payments/initiate

**Ödeme Başlat**

**Request:**

```json
{
  "orderId": "uuid",
  "amount": 500,
  "paymentMethod": "CREDIT_CARD",
  "paymentDetails": {
    "cardNumber": "encrypted",
    "cardHolder": "JOHN DOE",
    "expiryMonth": "12",
    "expiryYear": "2026",
    "cvv": "encrypted"
  }
}
```

### POST /api/v1/payments/{id}/confirm

**Ödemeyi Onayla**

### GET /api/v1/payments/{id}

**Ödeme Detayı**

### GET /api/v1/payments/history

**Ödeme Geçmişi**

---

## ⭐ Review Endpoints

### GET /api/v1/reviews

**İncelemeleri Listele**

**Query Parameters:**

- `targetType` (USER, PACKAGE, JOB)
- `targetId` (UUID)
- `rating` (1-5)
- `sort` (rating, helpful, recent)

### POST /api/v1/reviews

**İnceleme Yaz**

**Request:**

```json
{
  "orderId": "uuid",
  "targetType": "USER",
  "targetId": "uuid",
  "rating": 5,
  "title": "Excellent work!",
  "comment": "Very professional and delivered on time",
  "detailedRatings": {
    "quality": 5,
    "communication": 5,
    "delivery": 5,
    "professionalism": 5
  },
  "images": []
}
```

### GET /api/v1/reviews/{id}

**İnceleme Detayı**

### POST /api/v1/reviews/{id}/response

**İncelemeye Yanıt Ver**

### POST /api/v1/reviews/{id}/helpful

**Yararlı İşaretle**

---

## 📚 Category Endpoints

### GET /api/v1/categories

**Kategorileri Listele**

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Web Development",
      "slug": "web-development",
      "icon": "code",
      "children": [
        {
          "id": "uuid",
          "name": "Frontend",
          "slug": "frontend"
        }
      ],
      "jobCount": 150,
      "packageCount": 89
    }
  ]
}
```

### GET /api/v1/categories/{id}

**Kategori Detayı**

---

## 🎫 Support Endpoints

### GET /api/v1/support/tickets

**Destek Taleplerini Listele**

### POST /api/v1/support/tickets

**Destek Talebi Oluştur**

**Request:**

```json
{
  "subject": "Payment issue",
  "description": "I cannot complete payment...",
  "category": "PAYMENT",
  "priority": "HIGH",
  "relatedOrderId": "uuid",
  "attachments": []
}
```

### GET /api/v1/support/tickets/{id}

**Talep Detayı**

### POST /api/v1/support/tickets/{id}/responses

**Yanıt Ekle**

### POST /api/v1/support/tickets/{id}/close

**Talebi Kapat**

---

## 🔔 Notification Endpoints

### GET /api/v1/notifications

**Bildirimleri Getir**

### POST /api/v1/notifications/{id}/read

**Bildirimi Okundu İşaretle**

### POST /api/v1/notifications/read-all

**Tümünü Okundu İşaretle**

---

## 🔍 Search Endpoints

### GET /api/v1/search

**Genel Arama**

**Query Parameters:**

- `q` (search query)
- `type` (jobs, packages, users, all)
- `filters` (JSON)

**Example:** `/api/v1/search?q=react+developer&type=jobs&page=0`

### GET /api/v1/search/suggestions

**Arama Önerileri**

---

## 📊 Admin Endpoints

### GET /api/v1/admin/dashboard

**Admin Dashboard İstatistikleri**

### GET /api/v1/admin/users

**Kullanıcı Yönetimi**

### PUT /api/v1/admin/users/{id}/status

**Kullanıcı Durumu Güncelle**

### GET /api/v1/admin/moderation/queue

**Moderasyon Kuyruğu**

---

## 📝 HTTP Status Codes

| Code | Meaning               | Usage                      |
| ---- | --------------------- | -------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH |
| 201  | Created               | Successful POST            |
| 204  | No Content            | Successful DELETE          |
| 400  | Bad Request           | Validation error           |
| 401  | Unauthorized          | Not authenticated          |
| 403  | Forbidden             | Not authorized             |
| 404  | Not Found             | Resource not found         |
| 409  | Conflict              | Duplicate resource         |
| 422  | Unprocessable Entity  | Business logic error       |
| 429  | Too Many Requests     | Rate limit exceeded        |
| 500  | Internal Server Error | Server error               |
| 503  | Service Unavailable   | Maintenance                |

---

## 🔒 Rate Limiting

```
Standard: 100 requests/minute
Authenticated: 1000 requests/minute
Admin: 5000 requests/minute
```

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1633024800
```

---

## 📱 WebSocket Endpoints

### Connection

```
ws://localhost:8080/ws
wss://api.marifetbul.com/ws (Production)
```

### Authentication

```javascript
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  {
    Authorization: 'Bearer ' + token,
  },
  onConnect,
  onError
);
```

### Subscribe to Topics

```javascript
// Personal notifications
stompClient.subscribe('/user/queue/notifications', (message) => {
  const notification = JSON.parse(message.body);
  console.log(notification);
});

// Conversation messages
stompClient.subscribe('/user/queue/messages', (message) => {
  const msg = JSON.parse(message.body);
  console.log(msg);
});

// Typing indicators
stompClient.subscribe('/topic/conversation/{id}/typing', (message) => {
  const typingInfo = JSON.parse(message.body);
});
```

### Send Messages

```javascript
// Send message
stompClient.send(
  '/app/chat.send',
  {},
  JSON.stringify({
    conversationId: 'uuid',
    content: 'Hello!',
    type: 'TEXT',
  })
);

// Typing indicator
stompClient.send(
  '/app/chat.typing',
  {},
  JSON.stringify({
    conversationId: 'uuid',
    isTyping: true,
  })
);
```

---

## 🎨 Blog Endpoints

### GET /api/v1/blog/posts

**Blog Yazılarını Listele**

**Query Parameters:**

- `page`, `size`
- `categoryId`
- `tag`
- `status` (DRAFT, PUBLISHED)
- `authorId`
- `search` (title, content)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "10 Tips for Freelancers",
      "slug": "10-tips-for-freelancers",
      "excerpt": "Here are some essential tips...",
      "featuredImage": "https://...",
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "category": {
        "id": "uuid",
        "name": "Career Advice"
      },
      "tags": ["freelancing", "tips", "career"],
      "publishedAt": "2025-10-01T10:00:00Z",
      "readTime": 5,
      "views": 1250,
      "likes": 89
    }
  ],
  "pagination": { ... }
}
```

### POST /api/v1/blog/posts

**Blog Yazısı Oluştur** (Admin only)

**Request:**

```json
{
  "title": "How to Start Freelancing",
  "content": "<p>Full HTML content...</p>",
  "excerpt": "Short description...",
  "featuredImage": "https://...",
  "categoryId": "uuid",
  "tags": ["freelancing", "beginners"],
  "status": "PUBLISHED",
  "seo": {
    "metaTitle": "How to Start Freelancing - MarifetBul",
    "metaDescription": "Complete guide...",
    "keywords": ["freelancing", "guide"]
  }
}
```

### GET /api/v1/blog/posts/{slug}

**Blog Yazısı Detayı**

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "How to Start Freelancing",
    "slug": "how-to-start-freelancing",
    "content": "<p>Full content...</p>",
    "featuredImage": "https://...",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://...",
      "bio": "Content Writer at MarifetBul"
    },
    "category": { ... },
    "tags": [...],
    "publishedAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-05T14:30:00Z",
    "readTime": 8,
    "views": 2500,
    "likes": 145,
    "relatedPosts": [
      {
        "id": "uuid",
        "title": "...",
        "slug": "...",
        "featuredImage": "..."
      }
    ]
  }
}
```

### POST /api/v1/blog/posts/{id}/like

**Blog Yazısını Beğen**

### GET /api/v1/blog/categories

**Blog Kategorileri**

---

## 🔔 Advanced Notification Endpoints

### GET /api/v1/notifications/preferences

**Bildirim Tercihlerini Getir**

**Response:**

```json
{
  "success": true,
  "data": {
    "email": {
      "newProposal": true,
      "orderUpdate": true,
      "newMessage": false,
      "marketingEmails": false
    },
    "push": {
      "newProposal": true,
      "orderUpdate": true,
      "newMessage": true
    },
    "inApp": {
      "all": true
    }
  }
}
```

### PUT /api/v1/notifications/preferences

**Bildirim Tercihlerini Güncelle**

### GET /api/v1/notifications/settings

**Bildirim Ayarları**

---

## 💰 Wallet & Earnings Endpoints

### GET /api/v1/wallet/balance

**Cüzdan Bakiyesi**

**Response:**

```json
{
  "success": true,
  "data": {
    "availableBalance": 5420.5,
    "pendingBalance": 1200.0,
    "currency": "TRY",
    "totalEarnings": 45600.0,
    "totalWithdrawals": 38979.5,
    "lastTransactionAt": "2025-10-10T10:00:00Z"
  }
}
```

### GET /api/v1/wallet/transactions

**İşlem Geçmişi**

**Query Parameters:**

- `type` (EARNING, WITHDRAWAL, REFUND, FEE)
- `status` (PENDING, COMPLETED, FAILED)
- `from`, `to` (date range)

### POST /api/v1/wallet/withdraw

**Para Çekme İsteği**

**Request:**

```json
{
  "amount": 1000,
  "bankAccountId": "uuid",
  "note": "Monthly withdrawal"
}
```

### GET /api/v1/earnings/summary

**Kazanç Özeti**

**Response:**

```json
{
  "success": true,
  "data": {
    "thisMonth": {
      "total": 8500,
      "completed": 7200,
      "pending": 1300
    },
    "lastMonth": {
      "total": 6800,
      "completed": 6800,
      "pending": 0
    },
    "yearToDate": {
      "total": 45600,
      "completed": 42100,
      "pending": 3500
    },
    "topCategories": [
      {
        "category": "Web Development",
        "earnings": 25000
      }
    ]
  }
}
```

---

## 📈 Analytics Endpoints

### GET /api/v1/analytics/profile-views

**Profil Görüntüleme İstatistikleri** (Freelancer)

**Query Parameters:**

- `period` (7d, 30d, 90d, 1y)
- `granularity` (day, week, month)

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "change": "+15%",
    "timeseries": [
      {
        "date": "2025-10-01",
        "views": 45
      }
    ],
    "sources": {
      "search": 650,
      "direct": 300,
      "package": 200,
      "other": 100
    }
  }
}
```

### GET /api/v1/analytics/proposal-stats

**Teklif İstatistikleri** (Freelancer)

### GET /api/v1/analytics/job-performance

**İş İlanı Performansı** (Employer)

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "views": 580,
    "uniqueViews": 420,
    "proposals": 28,
    "avgProposalRate": 4250,
    "conversionRate": 4.8,
    "bestPerformingDay": "2025-10-05",
    "viewsBySource": {
      "search": 320,
      "category": 180,
      "recommendations": 80
    }
  }
}
```

---

## 🎯 Recommendation Endpoints

### GET /api/v1/recommendations/jobs

**Önerilen İşler** (Freelancer için)

**Query Parameters:**

- `size` (default: 10)
- `excludeSeen` (boolean)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "job": { ... },
      "matchScore": 0.92,
      "matchReasons": [
        "Skills match: React, Node.js",
        "Budget in your range",
        "Similar past projects"
      ]
    }
  ]
}
```

### GET /api/v1/recommendations/freelancers

**Önerilen Freelancer'lar** (Employer için)

### GET /api/v1/recommendations/packages

**Önerilen Paketler**

---

## 🏆 Badges & Achievements Endpoints

### GET /api/v1/users/{id}/badges

**Kullanıcı Rozetleri**

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "TOP_RATED",
      "name": "Top Rated Freelancer",
      "description": "Maintained 4.8+ rating with 50+ reviews",
      "icon": "https://...",
      "earnedAt": "2025-08-01T10:00:00Z",
      "level": "GOLD"
    },
    {
      "id": "uuid",
      "type": "FAST_RESPONDER",
      "name": "Lightning Fast",
      "description": "Responds within 1 hour 95% of the time",
      "icon": "https://...",
      "earnedAt": "2025-09-15T10:00:00Z",
      "level": "SILVER"
    }
  ]
}
```

### GET /api/v1/achievements/progress

**Rozet İlerleme Durumu**

---

## 🔐 Security Headers

All responses should include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 📊 Pagination Standards

### Query Parameters

```
page: 0-indexed page number (default: 0)
size: items per page (default: 20, max: 100)
sort: field,direction (e.g., createdAt,desc)
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false,
    "first": true,
    "last": false
  }
}
```

---

## 🔄 Bulk Operations

### POST /api/v1/jobs/bulk/close

**Toplu İş Kapatma**

**Request:**

```json
{
  "jobIds": ["uuid1", "uuid2", "uuid3"],
  "reason": "Positions filled"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "successful": ["uuid1", "uuid2"],
    "failed": [
      {
        "jobId": "uuid3",
        "reason": "Job already closed"
      }
    ]
  }
}
```

### PUT /api/v1/notifications/bulk/read

**Toplu Bildirim Okundu İşaretleme**

---

## 🎫 Dispute Resolution Endpoints

### POST /api/v1/orders/{id}/dispute

**Anlaşmazlık Başlat**

**Request:**

```json
{
  "reason": "WORK_NOT_DELIVERED",
  "description": "The freelancer did not deliver...",
  "evidence": [
    {
      "type": "MESSAGE_THREAD",
      "conversationId": "uuid"
    },
    {
      "type": "FILE",
      "url": "https://..."
    }
  ]
}
```

### GET /api/v1/disputes/{id}

**Anlaşmazlık Detayı**

### POST /api/v1/disputes/{id}/respond

**Anlaşmazlığa Yanıt Ver**

### POST /api/v1/disputes/{id}/resolve

**Anlaşmazlığı Çöz** (Admin only)

---

## 📤 File Upload Endpoints

### POST /api/v1/upload/image

**Resim Yükle**

**Request:** `multipart/form-data`

```
file: [binary]
category: profile|portfolio|message|blog
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://cdn.marifetbul.com/uploads/...",
    "thumbnail": "https://cdn.marifetbul.com/uploads/.../thumb.jpg",
    "filename": "image.jpg",
    "size": 524288,
    "mimeType": "image/jpeg"
  }
}
```

### POST /api/v1/upload/document

**Döküman Yükle**

**Supported formats:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP

### POST /api/v1/upload/video

**Video Yükle** (max 100MB)

---

## 🌐 Localization Endpoints

### GET /api/v1/localization/strings

**Çeviri Metinlerini Getir**

**Query Parameters:**

- `locale` (tr, en, de)
- `namespace` (common, auth, jobs, etc.)

**Response:**

```json
{
  "success": true,
  "data": {
    "common.welcome": "Hoş geldiniz",
    "common.search": "Ara",
    "jobs.title": "İş İlanları"
  }
}
```

---

## 📊 Export Endpoints

### GET /api/v1/export/orders

**Sipariş Verilerini Dışa Aktar**

**Query Parameters:**

- `format` (csv, excel, pdf)
- `from`, `to` (date range)
- `status`

**Response:** File download

### GET /api/v1/export/earnings

**Kazanç Raporunu Dışa Aktar**

---

## 🔍 Advanced Search Filters

### POST /api/v1/search/advanced

**Gelişmiş Arama**

**Request:**

```json
{
  "query": "react developer",
  "filters": {
    "type": "JOBS",
    "categories": ["uuid1", "uuid2"],
    "skills": ["React", "TypeScript"],
    "location": {
      "country": "Turkey",
      "city": "Istanbul",
      "remote": true
    },
    "budget": {
      "min": 5000,
      "max": 20000,
      "currency": "TRY"
    },
    "experienceLevel": ["INTERMEDIATE", "EXPERT"],
    "availability": "FULL_TIME",
    "verified": true,
    "rating": {
      "min": 4.5
    }
  },
  "sort": {
    "field": "relevance",
    "order": "desc"
  },
  "page": 0,
  "size": 20
}
```

---

## 🎯 API Best Practices

### 1. Idempotency

Use `Idempotency-Key` header for POST/PUT/PATCH requests:

```
POST /api/v1/orders
Idempotency-Key: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

### 2. Conditional Requests

Use `If-Match` / `If-None-Match` headers:

```
PUT /api/v1/jobs/{id}
If-Match: "686897696a7c876b7e"
```

### 3. Partial Responses

Use `fields` parameter to get only needed fields:

```
GET /api/v1/jobs?fields=id,title,budget
```

### 4. Request Compression

Client should send:

```
Content-Encoding: gzip
Accept-Encoding: gzip, deflate
```

---

**Doküman Durumu**: ✅ Tamamlandı ve Detaylandırıldı  
**Sonraki Adım**: Güvenlik - [05-SECURITY.md](./05-SECURITY.md)
