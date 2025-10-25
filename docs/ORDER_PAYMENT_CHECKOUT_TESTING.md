# ORDER & PAYMENT CHECKOUT - TEST GUIDE

## Test Environment Setup

### 1. Environment Variables

```bash
# Copy environment example
cp .env.local.example .env.local

# Add Stripe test keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

### 2. Backend Setup

```bash
cd marifetbul-backend
./mvnw spring-boot:run
```

### 3. Frontend Setup

```bash
npm install
npm run dev
```

## Stripe Test Cards

### Successful Payments

- **Basic Card**: 4242 4242 4242 4242
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

### 3D Secure Authentication

- **Requires Auth**: 4000 0027 6000 3184
- **Authentication Required**: 4000 0025 0000 3155

### Declined Cards

- **Generic Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995
- **Lost Card**: 4000 0000 0000 9987
- **Stolen Card**: 4000 0000 0000 9979

### Test Card Details

- **Expiry Date**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any valid postal code (e.g., 12345)

## Test Scenarios

### Scenario 1: Successful Payment Flow

**Objective**: Complete a successful payment from package selection to order confirmation

**Steps**:

1. Navigate to marketplace: `http://localhost:3000/marketplace`
2. Select a package
3. Click "Satın Al" (Buy Now)
4. Fill in requirements form
5. Enter payment details:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
6. Click "₺XXX Öde" (Pay)
7. Verify redirect to success page
8. Check order in dashboard

**Expected Results**:

- ✅ Payment intent created
- ✅ Payment processed successfully
- ✅ Order status: PENDING_PAYMENT → PAID
- ✅ Escrow status: HELD
- ✅ Success page displays order details
- ✅ Email notification sent

### Scenario 2: 3D Secure Authentication

**Objective**: Test 3D Secure payment flow

**Steps**:

1. Go to checkout page
2. Enter card requiring 3DS: 4000 0027 6000 3184
3. Click "Öde"
4. Complete 3D Secure challenge modal
5. Verify payment success

**Expected Results**:

- ✅ 3D Secure modal appears
- ✅ Authentication succeeds
- ✅ Payment completes after auth
- ✅ Order created successfully

### Scenario 3: Declined Card

**Objective**: Handle card declined gracefully

**Steps**:

1. Go to checkout page
2. Enter declined card: 4000 0000 0000 0002
3. Click "Öde"
4. Observe error message

**Expected Results**:

- ✅ Error message displayed: "Kartınız reddedildi"
- ✅ User can retry with different card
- ✅ No order created
- ✅ No charge attempted

### Scenario 4: Insufficient Funds

**Objective**: Test insufficient funds error handling

**Steps**:

1. Go to checkout page
2. Enter card: 4000 0000 0000 9995
3. Click "Öde"
4. Check error message

**Expected Results**:

- ✅ Error: "Kartınızda yetersiz bakiye var"
- ✅ Payment fails gracefully
- ✅ User can use different payment method

### Scenario 5: Payment Cancellation

**Objective**: Test user cancellation during payment

**Steps**:

1. Start checkout process
2. Fill requirements form
3. Close browser/tab before payment
4. Navigate back to checkout
5. Verify order state

**Expected Results**:

- ✅ Order remains in draft state
- ✅ No payment attempt recorded
- ✅ User can restart checkout

### Scenario 6: Escrow Display

**Objective**: Verify escrow status display for buyers

**Steps**:

1. Complete successful payment
2. Navigate to order detail page
3. Check escrow status component

**Expected Results**:

- ✅ Escrow status: "Emanette"
- ✅ Amount shown correctly
- ✅ Release condition displayed
- ✅ Timeline shows "Emanete Alındı" event

### Scenario 7: Escrow Release (Buyer Side)

**Objective**: Test escrow release after delivery acceptance

**Steps**:

1. Freelancer delivers order
2. Buyer views delivery
3. Buyer clicks "Teslimatı Onayla"
4. Check escrow status update

**Expected Results**:

- ✅ Escrow status: "HELD" → "RELEASED"
- ✅ Payment released to freelancer wallet
- ✅ Timeline updated
- ✅ Order status: COMPLETED

### Scenario 8: Refund Request (Full)

**Objective**: Request full refund

**Steps**:

1. Navigate to completed order
2. Click "İade Talebi"
3. Select "Tam İade"
4. Enter reason (min 10 chars)
5. Submit refund request

**Expected Results**:

- ✅ Refund request created
- ✅ Status: PENDING
- ✅ Notification sent to admin
- ✅ Escrow status: HELD

### Scenario 9: Refund Request (Partial)

**Objective**: Request partial refund

**Steps**:

1. Go to order detail
2. Click "İade Talebi"
3. Select "Kısmi İade"
4. Enter amount (e.g., 50% of total)
5. Enter reason
6. Submit

**Expected Results**:

- ✅ Partial amount calculated correctly
- ✅ Refund request created
- ✅ Platform fee not refundable
- ✅ Remaining amount stays in escrow

### Scenario 10: Payment Timeline

**Objective**: Verify payment timeline accuracy

**Steps**:

1. Create order
2. Make payment
3. View order detail
4. Check timeline component

**Expected Results**:

- ✅ "Sipariş Oluşturuldu" event
- ✅ "Ödeme Yapıldı" event
- ✅ "Emanete Alındı" event
- ✅ Timestamps accurate
- ✅ Actor names correct

## Error Handling Tests

### Network Errors

**Test**: Disconnect internet during payment
**Expected**: Error message, retry option

### Invalid Card Details

**Test**: Enter invalid card number
**Expected**: Real-time validation error

### Expired Card

**Test**: Use card 4000 0000 0000 0069
**Expected**: "Kartınızın süresi dolmuş"

### Incorrect CVC

**Test**: Card 4000 0000 0000 0127
**Expected**: "CVC kodu hatalı"

### Rate Limiting

**Test**: Multiple rapid payment attempts
**Expected**: Rate limit error, cooldown message

## Performance Tests

### Load Time

- Checkout page: < 2s
- Payment processing: < 5s
- Success page: < 1s

### Concurrent Payments

- 10 simultaneous checkouts
- No race conditions
- All payments processed correctly

## Security Tests

### XSS Prevention

- Test input fields with `<script>alert('xss')</script>`
- Expected: Sanitized, no execution

### CSRF Protection

- Attempt payment without CSRF token
- Expected: Request rejected

### Amount Tampering

- Try modifying amount in client
- Expected: Backend validation rejects

## Accessibility Tests

### Keyboard Navigation

- Tab through checkout form
- Enter to submit
- Escape to close modals

### Screen Reader

- Form labels announced
- Error messages announced
- Success confirmation announced

### Color Contrast

- WCAG AA compliance
- Error states visible

## Browser Compatibility

### Desktop

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile

- ✅ iOS Safari 14+
- ✅ Chrome Android
- ✅ Samsung Internet

## API Integration Tests

### Backend Endpoints

```bash
# Create Payment Intent
POST /api/v1/payments/intent
Body: { orderId, amount, currency }
Expected: 201, { paymentId, clientSecret }

# Confirm Payment
POST /api/v1/payments/intent/:id/confirm
Expected: 200, { status: 'succeeded' }

# Request Refund
POST /api/v1/payments/refund/request
Body: { paymentId, refundType, amount?, reason }
Expected: 201, { refundId, status }

# Get Payment History
GET /api/v1/payments/history
Expected: 200, { transactions: [...] }
```

## Monitoring & Logging

### Check Logs

```bash
# Frontend (Next.js)
tail -f .next/server.log

# Backend (Spring Boot)
tail -f logs/application.log
```

### Stripe Dashboard

- Monitor events: https://dashboard.stripe.com/test/events
- Check payments: https://dashboard.stripe.com/test/payments
- View webhooks: https://dashboard.stripe.com/test/webhooks

## Test Checklist

### Pre-Deployment

- [ ] All test scenarios pass
- [ ] Error handling verified
- [ ] Escrow flow working
- [ ] Refund system functional
- [ ] Timeline accurate
- [ ] No console errors
- [ ] TypeScript compilation clean
- [ ] Linting passes
- [ ] Performance benchmarks met
- [ ] Security tests pass

### Production Readiness

- [ ] Stripe live keys configured
- [ ] Webhook endpoint verified
- [ ] SSL certificate active
- [ ] Error tracking (Sentry) enabled
- [ ] Analytics tracking active
- [ ] Rate limiting configured
- [ ] Backup payment method available
- [ ] Customer support ready

## Known Issues & Limitations

1. **3D Secure Modal**: May not display in Safari private mode
2. **Webhook Delays**: Up to 30s latency during high traffic
3. **Refund Processing**: 7-14 business days for bank transfer
4. **Platform Fee**: Non-refundable (by design)

## Support & Resources

- Stripe Testing: https://stripe.com/docs/testing
- Payment API Docs: `/docs/PAYMENT_API.md`
- Support: support@marifetbul.com
- Emergency: +90 XXX XXX XX XX
