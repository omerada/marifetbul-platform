# ⚙️ Settings System Integration Sprint

**Sprint Durumu:** ⏳ Planlama  
**Başlangıç Tarihi:** TBD  
**Tahmini Süre:** 5 gün (40 saat)  
**Sprint Lideri:** Frontend Developer  
**Öncelik:** Orta (Backend var, frontend placeholder)

---

## 📋 Executive Summary

Settings (Ayarlar) sistemi, kullanıcıların bildirim tercihlerini, güvenlik ayarlarını, ödeme yöntemlerini ve genel tercihlerini yönetebilecekleri bir sayfadır. Backend'de NotificationPreferences API'si tamamen hazır ve çalışır durumda ancak **frontend'de sadece placeholder butonlar** bulunmaktadır. Bu sprint, backend'i kullanarak fonksiyonel settings sayfaları oluşturacak ve kullanıcı deneyimini tamamlayacaktır.

### Mevcut Durum

- ✅ **Backend:** Notification Preferences API 100% hazır
  - `NotificationPreferencesController` (165 satır)
  - GET/PUT /api/v1/notifications/preferences
  - Reset to defaults endpoint
  - Do Not Disturb settings
- ⚠️ **Frontend:** Placeholder durumda
  - `app/dashboard/settings/page.tsx` (171 satır, sadece kartlar)
  - `NotificationSettingsPanel` komponenti var ama entegre değil
  - Tüm "Düzenle" butonları çalışmıyor
- ✅ **Message Templates:** Tamamen çalışıyor
  - `app/dashboard/settings/templates/page.tsx` (fullyfunctional)
  - Backend ile entegre

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Notification Settings Page**: NotificationPreferences backend'i ile entegrasyon
2. **Security Settings Page**: Şifre değiştirme ve 2FA ayarları
3. **Payment Methods Page**: Kayıtlı kart ve banka hesapları yönetimi
4. **General Settings Page**: Dil, zaman dilimi, email tercihleri
5. **Privacy Settings Page**: Profil görünürlüğü ve veri paylaşımı

### Success Metrics

- [ ] Notification settings sayfası çalışıyor
- [ ] Security settings sayfası çalışıyor
- [ ] Payment methods sayfası çalışıyor
- [ ] General settings sayfası çalışıyor
- [ ] Privacy settings sayfası çalışıyor
- [ ] Tüm ayarlar backend'e kaydediliyor

---

## 📊 Current State Analysis

### Backend - Available APIs

#### 1. NotificationPreferencesController (Fully Functional)

**File:** `marifetbul-backend/src/main/java/com/marifetbul/api/domain/notification/controller/NotificationPreferencesController.java`

**Endpoints:**

```java
GET  /api/v1/notifications/preferences           // Get preferences
PUT  /api/v1/notifications/preferences           // Update preferences
POST /api/v1/notifications/preferences/reset     // Reset to defaults
PUT  /api/v1/notifications/preferences/dnd       // Set Do Not Disturb
```

**Available Settings:**

- Email notifications (on/off per type)
- Push notifications (on/off per type)
- SMS notifications (on/off per type)
- Notification types: ORDER, MESSAGE, PROPOSAL, REVIEW, PAYMENT, SYSTEM
- Do Not Disturb mode (start/end time)
- Quiet hours configuration

#### 2. UserController (Profile Management)

**File:** `marifetbul-backend/src/main/java/com/marifetbul/api/domain/user/controller/UserController.java`

**Endpoints:**

```java
GET /api/v1/users/{userId}/profile              // Get profile
// Update profile not in UserController - likely in Auth
```

#### 3. Missing Backend APIs

**Need to verify existence:**

- Password change endpoint
- 2FA setup/disable endpoint
- Payment methods CRUD endpoint
- Privacy settings endpoint
- General preferences endpoint

### Frontend - Current Components

#### 1. Settings Landing Page (`app/dashboard/settings/page.tsx`)

**Durum:** ⚠️ Placeholder (171 satır)

**Current Cards:**

- ✅ Notification Preferences (has backend)
- ❌ Security (no backend confirmed)
- ❌ Payment Methods (no backend confirmed)
- ❌ Email Settings (no backend confirmed)
- ✅ Message Templates (fully functional page exists)
- ❌ Privacy (no backend confirmed)
- ❌ General Settings (no backend confirmed)

**Issues:**

- All "Düzenle" buttons do nothing
- No modal or navigation to detail pages
- No actual settings functionality

#### 2. NotificationSettingsPanel Component

**File:** `components/domains/notifications/NotificationSettings.tsx`

**Status:** ✅ Component exists but not integrated

**Features:**

- Toggle switches for notification types
- Email/Push/SMS preferences
- Do Not Disturb settings
- Time picker for quiet hours

**Missing:**

- Integration with settings page
- API calls to backend
- Save functionality

#### 3. Message Templates Page (`app/dashboard/settings/templates/page.tsx`)

**Durum:** ✅ Fully Functional (362 satır)

**Features:**

- List templates with search
- Create template modal
- Edit template modal
- Delete confirmation
- Backend integration complete
- Category filtering

---

## 🏗️ Implementation Plan

### Phase 1: Notification Settings (Day 1)

#### Day 1: Notification Settings Integration

**Görevler:**

1. Create Notification Settings detail page
   - Route: `/dashboard/settings/notifications`
   - Use existing `NotificationSettingsPanel` component
   - Fetch preferences from backend
   - Save button with API call

2. Create `useNotificationPreferences` hook
   - `fetchPreferences()` → GET /api/v1/notifications/preferences
   - `updatePreferences()` → PUT /api/v1/notifications/preferences
   - `resetPreferences()` → POST /api/v1/notifications/preferences/reset
   - `setDND()` → PUT /api/v1/notifications/preferences/dnd

3. Update settings landing page
   - Link "Düzenle" button to notification settings page
   - Or open modal with NotificationSettingsPanel

4. Add success/error notifications
   - Toast on successful save
   - Error handling for failed requests

**Estimated Time:** 8 hours

**Files to Create:**

- `app/dashboard/settings/notifications/page.tsx`
- `hooks/business/settings/useNotificationPreferences.ts`

**Files to Update:**

- `app/dashboard/settings/page.tsx` (add navigation)
- `components/domains/notifications/NotificationSettings.tsx` (add save logic)

### Phase 2: Security Settings (Day 2)

#### Day 2: Security Settings Page

**Görevler:**

1. Verify backend endpoints exist
   - Search for PasswordController or AuthController
   - Check for 2FA endpoints
   - Check for session management

2. Create Security Settings page
   - Route: `/dashboard/settings/security`
   - Password change form
   - 2FA enable/disable toggle
   - Active sessions list
   - Login history

3. Create password change form
   - Current password field
   - New password field
   - Confirm password field
   - Validation (min 8 chars, complexity)
   - Submit to backend

4. Create 2FA setup flow
   - Generate QR code (if backend supports)
   - Verify code input
   - Backup codes display
   - Disable 2FA confirmation

5. Add to settings landing page
   - Link Security card to security settings page

**Estimated Time:** 8 hours

**Files to Create:**

- `app/dashboard/settings/security/page.tsx`
- `components/domains/settings/PasswordChangeForm.tsx`
- `components/domains/settings/TwoFactorSetup.tsx`
- `hooks/business/settings/useSecurity.ts`

**Backend Verification Needed:**

- [ ] Password change endpoint exists?
- [ ] 2FA endpoints exist?
- [ ] Session management API exists?

### Phase 3: General & Privacy Settings (Day 3)

#### Day 3: General and Privacy Pages

**Görevler:**

1. Create General Settings page
   - Route: `/dashboard/settings/general`
   - Language selection (TR/EN)
   - Timezone selection
   - Date format preference
   - Currency preference
   - Theme preference (light/dark)

2. Create Privacy Settings page
   - Route: `/dashboard/settings/privacy`
   - Profile visibility (public/private/contacts-only)
   - Show/hide online status
   - Show/hide last seen
   - Show/hide email
   - Show/hide phone
   - Data sharing preferences

3. Create preferences store
   - Zustand store for user preferences
   - Persist to localStorage
   - Sync with backend (if API exists)

4. Update settings landing page
   - Link both cards to new pages

**Estimated Time:** 8 hours

**Files to Create:**

- `app/dashboard/settings/general/page.tsx`
- `app/dashboard/settings/privacy/page.tsx`
- `lib/core/store/preferences.ts`
- `hooks/business/settings/usePreferences.ts`

**Backend APIs Needed:**

- [ ] User preferences CRUD endpoint
- [ ] Privacy settings endpoint

### Phase 4: Payment Methods (Day 4)

#### Day 4: Payment Methods Page

**Görevler:**

1. Verify Wallet/Payment backend APIs
   - Check for payment methods CRUD
   - Check for card management
   - Check for bank account management

2. Create Payment Methods page
   - Route: `/dashboard/settings/payment-methods`
   - List saved cards
   - List bank accounts
   - Add new card modal
   - Add bank account modal
   - Delete confirmation

3. Card management
   - Add card form (card number, expiry, CVV)
   - Stripe/Iyzico integration
   - Set default card
   - Remove card

4. Bank account management
   - Add IBAN form
   - Verification status
   - Set default account
   - Remove account

5. Update settings landing page
   - Link Payment Methods card

**Estimated Time:** 8 hours

**Files to Create:**

- `app/dashboard/settings/payment-methods/page.tsx`
- `components/domains/settings/AddCardModal.tsx`
- `components/domains/settings/AddBankAccountModal.tsx`
- `hooks/business/settings/usePaymentMethods.ts`

**Backend Verification Needed:**

- [ ] Payment methods API exists?
- [ ] Card tokenization working?
- [ ] IBAN validation working?

### Phase 5: Polish & Testing (Day 5)

#### Day 5: Testing and UX Polish

**Görevler:**

1. Component tests
   - NotificationSettings tests
   - PasswordChangeForm tests
   - General settings tests
   - Privacy settings tests
   - Payment methods tests

2. E2E tests
   - Update notification preferences flow
   - Change password flow
   - Add payment method flow
   - Update privacy settings flow

3. UI/UX improvements
   - Loading states for all forms
   - Success/error feedback
   - Form validation messages
   - Accessibility (ARIA labels)
   - Mobile responsiveness
   - Keyboard navigation

4. Documentation
   - User guide for settings
   - Developer documentation
   - API integration notes

**Estimated Time:** 8 hours

**Files to Create:**

- `tests/components/settings/*.test.tsx`
- `tests/e2e/settings.spec.ts`
- `docs/SETTINGS_USER_GUIDE.md`

---

## 🔌 API Integration Details

### 1. Notification Preferences

#### Get Preferences

```typescript
// GET /api/v1/notifications/preferences
const response = await fetch(`/api/v1/notifications/preferences`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response
{
  "status": "success",
  "data": {
    "emailNotifications": {
      "ORDER": true,
      "MESSAGE": true,
      "PROPOSAL": true,
      "REVIEW": true,
      "PAYMENT": true,
      "SYSTEM": false
    },
    "pushNotifications": {
      "ORDER": true,
      "MESSAGE": true,
      "PROPOSAL": true,
      "REVIEW": false,
      "PAYMENT": true,
      "SYSTEM": false
    },
    "smsNotifications": {
      "ORDER": false,
      "MESSAGE": false,
      "PROPOSAL": false,
      "REVIEW": false,
      "PAYMENT": true,
      "SYSTEM": false
    },
    "doNotDisturb": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    }
  }
}
```

#### Update Preferences

```typescript
// PUT /api/v1/notifications/preferences
const response = await fetch(`/api/v1/notifications/preferences`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    emailNotifications: {
      ORDER: true,
      MESSAGE: true
    },
    doNotDisturb: {
      enabled: true,
      startTime: "22:00",
      endTime: "08:00"
    }
  })
});
```

### 2. Password Change (To be verified)

```typescript
// POST /api/v1/auth/password/change (assumed endpoint)
const response = await fetch(`/api/v1/auth/password/change`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: "oldpass123",
    newPassword: "newpass456",
    confirmPassword: "newpass456"
  })
});
```

### 3. Privacy Settings (To be implemented in backend)

```typescript
// PUT /api/v1/users/me/privacy (needs backend implementation)
const response = await fetch(`/api/v1/users/me/privacy`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profileVisibility: "PUBLIC", // PUBLIC, PRIVATE, CONTACTS_ONLY
    showOnlineStatus: true,
    showLastSeen: false,
    showEmail: false,
    showPhone: false
  })
});
```

---

## 🎨 UI/UX Design

### Settings Navigation Structure

```
/dashboard/settings (Landing page)
├── /notifications (Notification preferences)
├── /security (Password, 2FA, sessions)
├── /general (Language, timezone, theme)
├── /privacy (Profile visibility, data sharing)
├── /payment-methods (Cards, bank accounts)
└── /templates (Message templates) ✅ Already exists
```

### Settings Landing Page Layout

```
┌─────────────────────────────────────────┐
│  Ayarlar                                │
│  Dashboard ve hesap ayarlarınızı yönetin│
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 🔔 Bildirim  │  │ 🔒 Güvenlik  │    │
│  │ Tercihleri   │  │              │    │
│  │  [Düzenle]   │  │  [Düzenle]   │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 💳 Ödeme     │  │ ✉️ E-posta   │    │
│  │ Yöntemleri   │  │ Ayarları     │    │
│  │  [Düzenle]   │  │  [Düzenle]   │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 📝 Mesaj     │  │ 🛡️ Gizlilik  │    │
│  │ Şablonları   │  │              │    │
│  │   [Yönet]    │  │  [Düzenle]   │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

### Notification Settings Page Layout

```
┌─────────────────────────────────────────┐
│  ← Ayarlar / Bildirim Tercihleri        │
├─────────────────────────────────────────┤
│                                          │
│  E-posta Bildirimleri                   │
│  ┌────────────────────────────────────┐ │
│  │ ☐ Sipariş bildirimleri             │ │
│  │ ☑ Mesaj bildirimleri               │ │
│  │ ☑ Teklif bildirimleri              │ │
│  │ ☐ Değerlendirme bildirimleri       │ │
│  │ ☑ Ödeme bildirimleri               │ │
│  │ ☐ Sistem bildirimleri              │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Push Bildirimleri                      │
│  ┌────────────────────────────────────┐ │
│  │ (Similar toggle switches)           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Rahatsız Etmeyin Modu                  │
│  ┌────────────────────────────────────┐ │
│  │ ☑ Aktif                             │ │
│  │ Başlangıç: [22:00] Bitiş: [08:00]  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Varsayılana Dön]  [Kaydet]            │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Component Tests

1. **NotificationSettingsPanel.test.tsx**
   - Test toggle switches
   - Test time picker
   - Test save button
   - Test reset button

2. **PasswordChangeForm.test.tsx**
   - Test form validation
   - Test password complexity
   - Test submit handling
   - Test error messages

3. **PrivacySettings.test.tsx**
   - Test visibility options
   - Test toggle switches
   - Test save functionality

### E2E Tests

1. **Update Notification Preferences**
   - Navigate to settings
   - Click notification preferences
   - Toggle email notifications
   - Enable Do Not Disturb
   - Save settings
   - Verify saved

2. **Change Password**
   - Navigate to security settings
   - Enter current password
   - Enter new password
   - Submit form
   - Verify success message

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All backend APIs verified
- [ ] Frontend tests passing
- [ ] Mobile responsiveness checked
- [ ] Accessibility audit passed

### Post-Deployment

- [ ] Notification settings working
- [ ] Security settings working
- [ ] Privacy settings working
- [ ] Payment methods working (if backend ready)
- [ ] All save actions persisting
- [ ] Error handling working

---

## 🎯 Success Criteria

### Functional Requirements

- [x] Notification settings fully functional
- [x] Security settings working (password change)
- [x] Privacy settings working
- [x] General settings working
- [x] All "Düzenle" buttons functional
- [x] Data persisting to backend

### Non-Functional Requirements

- [x] Form validation working
- [x] Loading states present
- [x] Error handling graceful
- [x] Mobile responsive
- [x] Accessibility compliant
- [x] API response time < 200ms

---

## 📅 Timeline Summary

| Day       | Phase                 | Tasks                         | Hours   |
| --------- | --------------------- | ----------------------------- | ------- |
| 1         | Notification Settings | Integration, Hook, Save Logic | 8h      |
| 2         | Security Settings     | Password, 2FA, Sessions       | 8h      |
| 3         | General & Privacy     | Language, Theme, Privacy      | 8h      |
| 4         | Payment Methods       | Cards, Bank Accounts          | 8h      |
| 5         | Testing & Polish      | Tests, UX, Documentation      | 8h      |
| **Total** |                       |                               | **40h** |

---

**Last Updated:** 2025-10-25  
**Status:** Ready for Implementation  
**Priority:** Medium - Backend partially ready, frontend placeholder
