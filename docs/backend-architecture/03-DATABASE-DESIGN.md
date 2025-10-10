# Veritabanı Tasarımı - MarifetBul Platform

> **Dokümantasyon**: 03 - Veritabanı Tasarımı  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 📋 İçindekiler

1. [Veritabanı Genel Yapısı](#veritabanı-genel-yapısı)
2. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram)
3. [Tablo Detayları](#tablo-detayları)
4. [İndeksler ve Performans](#indeksler-ve-performans)
5. [Migration Stratejisi](#migration-stratejisi)
6. [Veri Bütünlüğü](#veri-bütünlüğü)

---

## 🗄️ Veritabanı Genel Yapısı

### Teknoloji Stack

- **RDBMS**: PostgreSQL 15+
- **ORM**: Hibernate / Spring Data JPA
- **Migration**: Flyway
- **Indexing**: B-Tree, GiST (for full-text search)
- **Caching**: Redis (query cache)

### Database Schema Organization

```
marifetbul_db
├── Core Tables (User, Auth, Profile)
├── Marketplace Tables (Jobs, Packages, Proposals, Orders)
├── Communication Tables (Conversations, Messages)
├── Financial Tables (Payments, Transactions, Wallets)
├── Content Tables (Blog, Categories)
├── Support Tables (Tickets, Responses)
├── System Tables (Notifications, Audit, Settings)
└── Analytics Tables (Views, Clicks, Events)
```

---

## 📊 Entity Relationship Diagram

### Core Domain ERD (Simplified)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id           │───┐
│    email        │   │
│    password_hash│   │
│    user_type    │   │
│    first_name   │   │
│    last_name    │   │
│    avatar       │   │
│    created_at   │   │
└─────────────────┘   │
                      │
         ┌────────────┼────────────┐
         │            │            │
         │            │            │
┌────────▼──────┐ ┌───▼────────┐ ┌▼──────────────┐
│  FREELANCERS  │ │ EMPLOYERS  │ │    ADMINS     │
├───────────────┤ ├────────────┤ ├───────────────┤
│ PK user_id    │ │ PK user_id │ │ PK user_id    │
│    title      │ │ company_nm │ │    role       │
│    skills[]   │ │ company_sz │ │    permissions│
│    hourly_rate│ │ industry   │ └───────────────┘
│    rating     │ │ total_spent│
└───────────────┘ └────────────┘
         │                 │
         │                 │
┌────────▼──────┐ ┌────────▼──────┐
│    PACKAGES   │ │      JOBS     │
├───────────────┤ ├───────────────┤
│ PK id         │ │ PK id         │
│ FK freelancer │ │ FK employer_id│
│    title      │ │    title      │
│    price      │ │    budget     │
│    category   │ │    category   │
└───────┬───────┘ └───────┬───────┘
        │                 │
        │        ┌────────▼──────┐
        │        │   PROPOSALS   │
        │        ├───────────────┤
        │        │ PK id         │
        │        │ FK job_id     │
        │        │ FK freelancer │
        │        │    rate       │
        │        └───────┬───────┘
        │                │
        └────────┬───────┘
                 │
        ┌────────▼──────┐
        │    ORDERS     │
        ├───────────────┤
        │ PK id         │
        │ FK job_id     │
        │ FK package_id │
        │ FK employer_id│
        │ FK freelancer │
        │    amount     │
        │    status     │
        └───────┬───────┘
                │
        ┌───────▼──────┐
        │   PAYMENTS   │
        ├──────────────┤
        │ PK id        │
        │ FK order_id  │
        │    amount    │
        │    status    │
        └──────────────┘
```

---

## 📋 Tablo Detayları

### 1. USERS (Temel Kullanıcı Tablosu)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('FREELANCER', 'EMPLOYER', 'ADMIN')),

    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar TEXT,
    bio TEXT,
    location VARCHAR(100),

    -- Status
    account_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED')),
    verification_status VARCHAR(20) DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,

    -- Soft delete
    deleted_at TIMESTAMP,

    -- Version control (optimistic locking)
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

### 2. FREELANCERS (Freelancer Profil Detayları)

```sql
CREATE TABLE freelancers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Professional Info
    title VARCHAR(200),
    hourly_rate DECIMAL(10,2),
    experience_level VARCHAR(20) CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),

    -- Skills (array)
    skills TEXT[],
    languages TEXT[],

    -- Statistics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,

    -- Availability
    availability VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'BUSY', 'NOT_AVAILABLE')),
    response_time_hours INTEGER,

    -- Social Links (JSONB)
    social_links JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_freelancers_rating ON freelancers(rating DESC);
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills);
CREATE INDEX idx_freelancers_availability ON freelancers(availability);
```

### 3. EMPLOYERS (İşveren Profil Detayları)

```sql
CREATE TABLE employers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Company Info
    company_name VARCHAR(200),
    company_size VARCHAR(20) CHECK (company_size IN ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE')),
    industry VARCHAR(100),
    website VARCHAR(255),

    -- Statistics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employers_company ON employers(company_name);
CREATE INDEX idx_employers_industry ON employers(industry);
```

### 4. CATEGORIES (Kategori Sistemi)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),

    -- Hierarchy
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    meta_title VARCHAR(200),
    meta_description TEXT,

    -- Statistics
    job_count INTEGER DEFAULT 0,
    package_count INTEGER DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
```

### 5. JOBS (İş İlanları)

```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    -- Relations
    employer_id UUID NOT NULL REFERENCES employers(user_id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES freelancers(user_id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory VARCHAR(100),

    -- Skills
    skills TEXT[],
    tags TEXT[],

    -- Budget (embedded)
    budget_type VARCHAR(10) NOT NULL CHECK (budget_type IN ('FIXED', 'HOURLY')),
    budget_amount DECIMAL(10,2) NOT NULL,
    budget_max_amount DECIMAL(10,2),
    budget_currency VARCHAR(3) DEFAULT 'TRY',

    -- Timeline
    timeline VARCHAR(50),
    deadline TIMESTAMP,
    expires_at TIMESTAMP,

    -- Requirements
    experience_level VARCHAR(20) CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),
    requirements TEXT[],

    -- Location
    is_remote BOOLEAN DEFAULT TRUE,
    location VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'OPEN', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED', 'CLOSED')),

    -- Statistics
    proposals_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- Version control
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_budget ON jobs(budget_amount);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_jobs_location ON jobs(location);
```

### 6. PACKAGES (Hizmet Paketleri)

```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),

    -- Relations
    freelancer_id UUID NOT NULL REFERENCES freelancers(user_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory VARCHAR(100),

    -- Skills & Tags
    skills TEXT[],
    tags TEXT[],

    -- Pricing (Simple - for basic tier)
    price DECIMAL(10,2) NOT NULL,
    delivery_time INTEGER NOT NULL, -- days
    revisions INTEGER DEFAULT 0,

    -- Features
    features TEXT[],
    requirements TEXT[],

    -- Media
    images JSONB, -- Array of image URLs
    video TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'REJECTED')),

    -- Statistics
    views INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    version BIGINT DEFAULT 0
);

CREATE INDEX idx_packages_freelancer ON packages(freelancer_id);
CREATE INDEX idx_packages_category ON packages(category_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_price ON packages(price);
CREATE INDEX idx_packages_rating ON packages(rating DESC);
```

### 7. PACKAGE_TIERS (Paket Katmanları: Basic, Standard, Premium)

```sql
CREATE TABLE package_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,

    tier_level VARCHAR(20) NOT NULL CHECK (tier_level IN ('BASIC', 'STANDARD', 'PREMIUM')),
    title VARCHAR(100) NOT NULL,
    description TEXT,

    price DECIMAL(10,2) NOT NULL,
    delivery_time INTEGER NOT NULL,
    revisions INTEGER NOT NULL,

    features TEXT[],

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(package_id, tier_level)
);

CREATE INDEX idx_package_tiers_package ON package_tiers(package_id);
```

### 8. PROPOSALS (İş Teklifleri)

```sql
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES freelancers(user_id) ON DELETE CASCADE,

    -- Proposal Details
    cover_letter TEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NOT NULL,
    delivery_time INTEGER NOT NULL, -- days

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),

    -- Attachments
    attachments JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    responded_at TIMESTAMP,

    UNIQUE(job_id, freelancer_id) -- One proposal per freelancer per job
);

CREATE INDEX idx_proposals_job ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);
```

### 9. ORDERS (Siparişler)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., MRF-2025-001234

    -- Relations
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    employer_id UUID NOT NULL REFERENCES employers(user_id),
    freelancer_id UUID NOT NULL REFERENCES freelancers(user_id),

    -- Financial
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    freelancer_earning DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',

    -- Delivery
    delivery_time INTEGER NOT NULL,
    delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,

    -- Revisions
    included_revisions INTEGER DEFAULT 0,
    used_revisions INTEGER DEFAULT 0,
    additional_revisions INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED',
        'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED', 'DISPUTED'
    )),

    -- Files
    requirements JSONB, -- Files from employer
    deliverables JSONB, -- Files from freelancer

    -- Communication
    conversation_id UUID,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    started_at TIMESTAMP,
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP,

    version BIGINT DEFAULT 0,

    CHECK (job_id IS NOT NULL OR package_id IS NOT NULL)
);

CREATE INDEX idx_orders_employer ON orders(employer_id);
CREATE INDEX idx_orders_freelancer ON orders(freelancer_id);
CREATE INDEX idx_orders_job ON orders(job_id);
CREATE INDEX idx_orders_package ON orders(package_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
```

### 10. PAYMENTS (Ödemeler)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),

    -- Amount
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    platform_fee DECIMAL(10,2) NOT NULL,
    platform_fee_percentage DECIMAL(5,2) NOT NULL,

    -- Payment Method
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'BANK_TRANSFER', 'WALLET')),
    provider VARCHAR(50), -- e.g., 'iyzico', 'paytr'
    transaction_id VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'
    )),

    -- Escrow
    escrow_status VARCHAR(20) DEFAULT 'PENDING' CHECK (escrow_status IN (
        'PENDING', 'HELD', 'RELEASED', 'REFUNDED'
    )),
    escrow_held_at TIMESTAMP,
    escrow_released_at TIMESTAMP,

    -- Payment Details (encrypted)
    payment_details JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    version BIGINT DEFAULT 0
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
```

### 11. CONVERSATIONS (Konuşmalar)

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type VARCHAR(20) NOT NULL DEFAULT 'DIRECT' CHECK (type IN ('DIRECT', 'GROUP', 'SUPPORT', 'ORDER')),
    title VARCHAR(200),

    -- Related Resources
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Settings
    settings JSONB DEFAULT '{"allowInvites": true, "allowMediaSharing": true}',

    -- Status
    is_archived BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_job ON conversations(job_id);
CREATE INDEX idx_conversations_order ON conversations(order_id);
CREATE INDEX idx_conversations_updated ON conversations(last_message_at DESC NULLS LAST);
```

### 12. CONVERSATION_PARTICIPANTS (Konuşma Katılımcıları)

```sql
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN', 'OWNER')),

    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);
```

### 13. MESSAGES (Mesajlar)

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO', 'LOCATION', 'SYSTEM')),

    -- Attachments
    attachments JSONB,

    -- Threading
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;
```

### 14. REVIEWS (İncelemeler)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Target (polymorphic)
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('USER', 'PACKAGE', 'JOB')),
    target_id UUID NOT NULL,

    -- Relations
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),

    -- Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,

    -- Detailed Ratings
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

    -- Media
    images JSONB,

    -- Moderation
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')),
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    moderation_note TEXT,

    -- Statistics
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,

    -- Response
    response_content TEXT,
    response_created_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(order_id, reviewer_id)
);

CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
```

---

## 🚀 İndeksler ve Performans

### Index Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_jobs_category_status ON jobs(category_id, status);
CREATE INDEX idx_jobs_employer_status ON jobs(employer_id, status, created_at DESC);
CREATE INDEX idx_packages_freelancer_active ON packages(freelancer_id, is_active);
CREATE INDEX idx_orders_freelancer_status ON orders(freelancer_id, status, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_jobs_fulltext ON jobs USING GIN(to_tsvector('turkish', title || ' ' || description));
CREATE INDEX idx_packages_fulltext ON packages USING GIN(to_tsvector('turkish', title || ' ' || description));

-- Partial indexes for filtered queries
CREATE INDEX idx_jobs_open ON jobs(created_at DESC) WHERE status = 'OPEN';
CREATE INDEX idx_packages_active ON packages(created_at DESC) WHERE is_active = TRUE;
```

---

## 📝 Migration Stratejisi (Flyway)

### Migration File Naming

```
V1__init_schema.sql
V2__add_users.sql
V3__add_jobs_and_packages.sql
V4__add_orders_and_payments.sql
V5__add_messaging.sql
V6__add_reviews.sql
...
```

### Migration Example

```sql
-- V1__init_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity search

-- V2__add_users.sql
CREATE TABLE users (...);
CREATE TABLE freelancers (...);
CREATE TABLE employers (...);
```

---

## ✅ Veri Bütünlüğü

### Constraints

- **Primary Keys**: UUID with gen_random_uuid()
- **Foreign Keys**: CASCADE or SET NULL uygun şekilde
- **CHECK Constraints**: Enum values, numeric ranges
- **UNIQUE Constraints**: Email, order_number, etc.
- **NOT NULL**: Critical fields

### Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: API Tasarımı - [04-API-DESIGN.md](./04-API-DESIGN.md)
