# Mock API Servisleri

## API Base URL

```
Development: http://localhost:3000/api
Production: https://marifeto.com/api
```

## Authentication Endpoints

### POST /api/auth/register

Yeni kullanıcı kaydı

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "freelancer", // or "employer"
  "termsAccepted": true
}
```

**Response (201):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "freelancer",
    "isVerified": false,
    "createdAt": "2025-09-09T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login

Kullanıcı girişi

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "freelancer",
    "isVerified": true,
    "profile": {
      "avatar": "/avatars/user_123.jpg",
      "title": "Full Stack Developer",
      "rating": 4.8,
      "completedJobs": 45
    }
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/logout

Kullanıcı çıkışı

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Mevcut kullanıcı bilgileri

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "freelancer",
    "profile": {
      "avatar": "/avatars/user_123.jpg",
      "title": "Full Stack Developer",
      "bio": "Experienced developer with 5+ years...",
      "skills": ["React", "Node.js", "TypeScript"],
      "rating": 4.8,
      "completedJobs": 45,
      "location": "Istanbul, Turkey"
    }
  }
}
```

## User Profile Endpoints

### GET /api/users/{userId}

Kullanıcı profil detayları

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "freelancer",
    "profile": {
      "avatar": "/avatars/user_123.jpg",
      "title": "Full Stack Developer",
      "bio": "Experienced developer with 5+ years in web development...",
      "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
      "rating": 4.8,
      "reviewCount": 127,
      "completedJobs": 45,
      "location": "Istanbul, Turkey",
      "joinDate": "2023-01-15T00:00:00Z",
      "languages": ["Turkish", "English"],
      "hourlyRate": 150,
      "availability": "available", // available, busy, offline
      "responseTime": "1 hour"
    }
  }
}
```

### PUT /api/users/profile

Profil güncelleme

**Request Body:**

```json
{
  "title": "Full Stack Developer",
  "bio": "Updated bio text...",
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRate": 150,
  "location": "Istanbul, Turkey",
  "languages": ["Turkish", "English"]
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    // Updated profile data
  }
}
```

## Jobs Endpoints

### GET /api/jobs

İş ilanları listesi

**Query Parameters:**

```
?page=1
&limit=20
&category=web-development
&budget_min=1000
&budget_max=5000
&skills=react,nodejs
&location=istanbul
&job_type=fixed
&sort=newest
```

**Response (200):**

```json
{
  "success": true,
  "jobs": [
    {
      "id": "job_456",
      "title": "E-commerce Website Development",
      "description": "Looking for a skilled developer to build a modern e-commerce website...",
      "category": "web-development",
      "subcategory": "frontend",
      "employer": {
        "id": "employer_789",
        "firstName": "Jane",
        "lastName": "Smith",
        "company": "TechCorp Ltd",
        "avatar": "/avatars/employer_789.jpg",
        "rating": 4.6,
        "jobsPosted": 12
      },
      "budget": {
        "type": "fixed",
        "min": 3000,
        "max": 5000,
        "currency": "TRY"
      },
      "deadline": "2025-10-15T00:00:00Z",
      "skills": ["React", "Node.js", "MongoDB", "Stripe"],
      "location": "Remote",
      "proposalCount": 8,
      "status": "open", // open, in_progress, completed, closed
      "createdAt": "2025-09-01T10:00:00Z",
      "featured": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /api/jobs/{jobId}

İş ilanı detayları

**Response (200):**

```json
{
  "success": true,
  "job": {
    "id": "job_456",
    "title": "E-commerce Website Development",
    "description": "Looking for a skilled developer to build a modern e-commerce website with the following features:\n\n- User authentication and registration\n- Product catalog with search and filtering\n- Shopping cart and checkout process\n- Payment integration (Stripe)\n- Admin panel for product management\n- Responsive design for mobile and desktop\n\nPlease include your portfolio and estimated timeline in your proposal.",
    "category": "web-development",
    "subcategory": "fullstack",
    "employer": {
      "id": "employer_789",
      "firstName": "Jane",
      "lastName": "Smith",
      "company": "TechCorp Ltd",
      "avatar": "/avatars/employer_789.jpg",
      "rating": 4.6,
      "reviewCount": 23,
      "jobsPosted": 12,
      "memberSince": "2023-06-01T00:00:00Z",
      "location": "Istanbul, Turkey"
    },
    "budget": {
      "type": "fixed",
      "min": 3000,
      "max": 5000,
      "currency": "TRY"
    },
    "deadline": "2025-10-15T00:00:00Z",
    "skills": ["React", "Node.js", "MongoDB", "Stripe", "CSS"],
    "experienceLevel": "intermediate",
    "projectDuration": "1-3 months",
    "workType": "remote",
    "proposalCount": 8,
    "status": "open",
    "attachments": [
      {
        "id": "file_123",
        "name": "requirements.pdf",
        "url": "/files/job_456/requirements.pdf",
        "size": 1024000
      }
    ],
    "createdAt": "2025-09-01T10:00:00Z",
    "updatedAt": "2025-09-01T10:00:00Z"
  }
}
```

### POST /api/jobs

Yeni iş ilanı oluşturma (İşveren)

**Request Body:**

```json
{
  "title": "Mobile App UI/UX Design",
  "description": "Need a modern and user-friendly design for our mobile app...",
  "category": "design",
  "subcategory": "mobile-design",
  "budget": {
    "type": "fixed",
    "min": 2000,
    "max": 4000
  },
  "deadline": "2025-10-30T00:00:00Z",
  "skills": ["UI/UX", "Figma", "Mobile Design", "Prototyping"],
  "experienceLevel": "intermediate",
  "workType": "remote"
}
```

**Response (201):**

```json
{
  "success": true,
  "job": {
    "id": "job_789",
    "title": "Mobile App UI/UX Design",
    // ... other job fields
    "status": "open",
    "createdAt": "2025-09-09T10:00:00Z"
  }
}
```

### PUT /api/jobs/{jobId}

İş ilanı güncelleme

**Response (200):**

```json
{
  "success": true,
  "job": {
    // Updated job data
  }
}
```

### DELETE /api/jobs/{jobId}

İş ilanı silme

**Response (200):**

```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

## Packages Endpoints

### GET /api/packages

Freelancer paketleri listesi

**Query Parameters:**

```
?page=1
&limit=20
&category=web-development
&price_min=500
&price_max=2000
&delivery_max=7
&rating_min=4
&skills=react,nodejs
&sort=rating
```

**Response (200):**

```json
{
  "success": true,
  "packages": [
    {
      "id": "package_123",
      "title": "Professional React Website Development",
      "description": "I'll create a modern, responsive website using React and latest web technologies.",
      "category": "web-development",
      "subcategory": "frontend",
      "freelancer": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "/avatars/user_123.jpg",
        "title": "Full Stack Developer",
        "rating": 4.8,
        "reviewCount": 127,
        "level": "level_2" // level_1, level_2, top_rated
      },
      "pricing": {
        "basic": {
          "price": 800,
          "title": "Basic Website",
          "deliveryDays": 7,
          "features": [
            "5 pages",
            "Responsive design",
            "Contact form",
            "Basic SEO"
          ]
        },
        "standard": {
          "price": 1500,
          "title": "Standard Website",
          "deliveryDays": 10,
          "features": [
            "10 pages",
            "Responsive design",
            "Contact form",
            "Advanced SEO",
            "Content management",
            "Social media integration"
          ]
        },
        "premium": {
          "price": 2500,
          "title": "Premium Website",
          "deliveryDays": 14,
          "features": [
            "Unlimited pages",
            "Responsive design",
            "Contact form",
            "Advanced SEO",
            "Content management",
            "Social media integration",
            "E-commerce functionality",
            "Performance optimization"
          ]
        }
      },
      "images": [
        "/packages/package_123/image1.jpg",
        "/packages/package_123/image2.jpg"
      ],
      "skills": ["React", "JavaScript", "CSS", "HTML"],
      "orderCount": 45,
      "inQueue": 3,
      "createdAt": "2025-08-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

### GET /api/packages/{packageId}

Paket detayları

**Response (200):**

```json
{
  "success": true,
  "package": {
    "id": "package_123",
    "title": "Professional React Website Development",
    "description": "I'll create a modern, responsive website using React and latest web technologies. With over 5 years of experience, I specialize in creating fast, SEO-friendly websites that convert visitors into customers.",
    "category": "web-development",
    "subcategory": "frontend",
    "freelancer": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "/avatars/user_123.jpg",
      "title": "Full Stack Developer",
      "bio": "Experienced developer with 5+ years...",
      "rating": 4.8,
      "reviewCount": 127,
      "completedOrders": 89,
      "responseTime": "1 hour",
      "level": "level_2",
      "location": "Istanbul, Turkey"
    },
    "pricing": {
      // Same as above
    },
    "images": [
      "/packages/package_123/image1.jpg",
      "/packages/package_123/image2.jpg",
      "/packages/package_123/image3.jpg"
    ],
    "video": "/packages/package_123/demo.mp4",
    "skills": ["React", "JavaScript", "CSS", "HTML", "Node.js"],
    "faq": [
      {
        "question": "Do you provide source code?",
        "answer": "Yes, you'll receive the complete source code along with documentation."
      },
      {
        "question": "Can you work with my existing design?",
        "answer": "Absolutely! I can work with your existing designs or create new ones."
      }
    ],
    "extras": [
      {
        "id": "extra_1",
        "title": "Additional page",
        "price": 100,
        "deliveryDays": 1
      },
      {
        "id": "extra_2",
        "title": "Mobile app version",
        "price": 800,
        "deliveryDays": 5
      }
    ],
    "reviews": [
      {
        "id": "review_456",
        "user": {
          "firstName": "Alice",
          "lastName": "Johnson",
          "avatar": "/avatars/user_456.jpg"
        },
        "rating": 5,
        "comment": "Excellent work! John delivered exactly what I needed on time.",
        "createdAt": "2025-08-20T10:00:00Z"
      }
    ],
    "orderCount": 45,
    "inQueue": 3,
    "status": "active", // active, paused, draft
    "createdAt": "2025-08-15T10:00:00Z",
    "updatedAt": "2025-09-01T10:00:00Z"
  }
}
```

### POST /api/packages

Yeni paket oluşturma (Freelancer)

**Request Body:**

```json
{
  "title": "Logo Design Service",
  "description": "Professional logo design for your business...",
  "category": "design",
  "subcategory": "logo-design",
  "pricing": {
    "basic": {
      "price": 300,
      "title": "Basic Logo",
      "deliveryDays": 3,
      "features": ["1 logo concept", "2 revisions", "PNG files"]
    },
    "standard": {
      "price": 600,
      "title": "Standard Logo",
      "deliveryDays": 5,
      "features": [
        "3 logo concepts",
        "5 revisions",
        "PNG + JPG + PDF files",
        "Source files"
      ]
    }
  },
  "skills": ["Logo Design", "Adobe Illustrator", "Branding"],
  "images": ["base64_image_data"]
}
```

**Response (201):**

```json
{
  "success": true,
  "package": {
    "id": "package_456",
    // ... package data
    "status": "draft"
  }
}
```

## Proposals/Offers Endpoints

### GET /api/proposals

Teklifler listesi

**Query Parameters:**

```
?status=pending  // pending, accepted, rejected, withdrawn
&job_id=job_456
&freelancer_id=user_123
```

**Response (200):**

```json
{
  "success": true,
  "proposals": [
    {
      "id": "proposal_789",
      "job": {
        "id": "job_456",
        "title": "E-commerce Website Development",
        "budget": { "min": 3000, "max": 5000 }
      },
      "freelancer": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "/avatars/user_123.jpg",
        "title": "Full Stack Developer",
        "rating": 4.8
      },
      "coverLetter": "Hello! I'm interested in your e-commerce project...",
      "proposedBudget": 4200,
      "deliveryTime": 21, // days
      "attachments": [
        {
          "name": "portfolio.pdf",
          "url": "/files/proposal_789/portfolio.pdf"
        }
      ],
      "status": "pending", // pending, accepted, rejected, withdrawn
      "createdAt": "2025-09-02T10:00:00Z",
      "updatedAt": "2025-09-02T10:00:00Z"
    }
  ]
}
```

### POST /api/proposals

Yeni teklif verme (Freelancer)

**Request Body:**

```json
{
  "jobId": "job_456",
  "coverLetter": "Hello! I'm interested in your project because...",
  "proposedBudget": 4200,
  "deliveryTime": 21,
  "attachments": ["file_upload_ids"]
}
```

**Response (201):**

```json
{
  "success": true,
  "proposal": {
    "id": "proposal_789",
    // ... proposal data
    "status": "pending"
  }
}
```

### PUT /api/proposals/{proposalId}/status

Teklif durumu güncelleme (İşveren)

**Request Body:**

```json
{
  "status": "accepted", // accepted, rejected
  "message": "Great proposal! Let's get started."
}
```

**Response (200):**

```json
{
  "success": true,
  "proposal": {
    // Updated proposal data
  }
}
```

## Orders Endpoints

### GET /api/orders

Siparişler listesi

**Response (200):**

```json
{
  "success": true,
  "orders": [
    {
      "id": "order_456",
      "package": {
        "id": "package_123",
        "title": "Professional React Website Development",
        "selectedTier": "standard"
      },
      "freelancer": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "/avatars/user_123.jpg"
      },
      "client": {
        "id": "user_789",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatar": "/avatars/user_789.jpg"
      },
      "amount": 1500,
      "deliveryDate": "2025-09-19T00:00:00Z",
      "status": "in_progress", // pending, in_progress, delivered, completed, cancelled
      "requirements": "Please create a website for my restaurant...",
      "createdAt": "2025-09-09T10:00:00Z"
    }
  ]
}
```

### POST /api/orders

Yeni sipariş oluşturma

**Request Body:**

```json
{
  "packageId": "package_123",
  "tier": "standard", // basic, standard, premium
  "extras": ["extra_1", "extra_2"],
  "requirements": "Detailed requirements for the project...",
  "totalAmount": 1600
}
```

**Response (201):**

```json
{
  "success": true,
  "order": {
    "id": "order_789",
    // ... order data
    "status": "pending"
  }
}
```

## Categories Endpoints

### GET /api/categories

Kategori listesi

**Response (200):**

```json
{
  "success": true,
  "categories": [
    {
      "id": "web-development",
      "name": "Web Development",
      "description": "Website and web application development",
      "icon": "/icons/web-dev.svg",
      "subcategories": [
        {
          "id": "frontend",
          "name": "Frontend Development",
          "description": "User interface development"
        },
        {
          "id": "backend",
          "name": "Backend Development",
          "description": "Server-side development"
        },
        {
          "id": "fullstack",
          "name": "Full Stack Development",
          "description": "Complete web development"
        }
      ],
      "packageCount": 156,
      "jobCount": 89
    },
    {
      "id": "design",
      "name": "Design",
      "description": "Graphic design and UI/UX services",
      "icon": "/icons/design.svg",
      "subcategories": [
        {
          "id": "logo-design",
          "name": "Logo Design",
          "description": "Brand identity and logo creation"
        },
        {
          "id": "web-design",
          "name": "Web Design",
          "description": "Website design and UI/UX"
        }
      ],
      "packageCount": 234,
      "jobCount": 67
    }
  ]
}
```

## Dashboard Endpoints

### GET /api/dashboard/freelancer

Freelancer dashboard verileri

**Response (200):**

```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "activeProposals": 5,
      "monthlyViews": 1247,
      "potentialEarnings": 8900,
      "completedJobs": 45
    },
    "recentActivity": [
      {
        "type": "proposal_sent",
        "title": "New proposal sent",
        "description": "E-commerce Website Development",
        "timestamp": "2025-09-09T09:30:00Z"
      },
      {
        "type": "order_completed",
        "title": "Order completed",
        "description": "Logo Design Project",
        "timestamp": "2025-09-08T14:20:00Z"
      }
    ],
    "pendingOrders": [
      {
        "id": "order_456",
        "title": "Website Development",
        "client": "Jane Smith",
        "deadline": "2025-09-15T00:00:00Z",
        "status": "in_progress"
      }
    ]
  }
}
```

### GET /api/dashboard/employer

İşveren dashboard verileri

**Response (200):**

```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "activeJobs": 3,
      "pendingProposals": 12,
      "monthlySpending": 5600,
      "completedProjects": 8
    },
    "recentActivity": [
      {
        "type": "proposal_received",
        "title": "New proposal received",
        "description": "Mobile App Development",
        "timestamp": "2025-09-09T10:15:00Z"
      }
    ],
    "activeJobs": [
      {
        "id": "job_456",
        "title": "E-commerce Website",
        "proposalCount": 8,
        "budget": { "min": 3000, "max": 5000 },
        "deadline": "2025-10-15T00:00:00Z"
      }
    ]
  }
}
```

## Search Endpoints

### GET /api/search

Genel arama

**Query Parameters:**

```
?q=react developer
&type=packages  // packages, jobs, freelancers
&category=web-development
```

**Response (200):**

```json
{
  "success": true,
  "results": {
    "packages": [
      // Package results
    ],
    "jobs": [
      // Job results
    ],
    "freelancers": [
      // Freelancer results
    ]
  },
  "totalResults": 45
}
```

## File Upload Endpoints

### POST /api/upload

Dosya yükleme

**Request:** FormData with file

**Response (200):**

```json
{
  "success": true,
  "file": {
    "id": "file_123",
    "filename": "document.pdf",
    "originalName": "requirements.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "/uploads/file_123.pdf"
  }
}
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Not found",
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```
