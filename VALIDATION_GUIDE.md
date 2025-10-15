# Form Validation Guide - Marifetbul Platform

**Version**: 1.0  
**Last Updated**: October 15, 2025  
**Pattern**: react-hook-form + Zod

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Zod + React Hook Form?](#why-zod--react-hook-form)
3. [Quick Start](#quick-start)
4. [Creating Validation Schemas](#creating-validation-schemas)
5. [Using Schemas in Forms](#using-schemas-in-forms)
6. [Common Validation Patterns](#common-validation-patterns)
7. [Error Handling](#error-handling)
8. [Testing Validations](#testing-validations)
9. [Migration Guide](#migration-guide)
10. [Best Practices](#best-practices)

---

## Overview

All forms in the Marifetbul platform use **react-hook-form** + **Zod** for type-safe, declarative validation.

### Current Adoption Status

- **Modern Pattern (React Hook Form + Zod)**: 82% (9/11 forms)
- **Forms Using Modern Pattern**: LoginForm, RegisterForm, ProposalForm, ReviewForm, PackageOrderForm, MultiStepRegisterForm, PaymentForm, TicketForm, OrderForm

### Benefits

✅ **Type Safety**: Automatic TypeScript inference from schemas  
✅ **Declarative**: Validation rules in one place  
✅ **Reusable**: Schemas shared across frontend/backend  
✅ **Better UX**: Automatic error messages  
✅ **Less Code**: ~50% reduction in validation boilerplate  
✅ **Testing**: Easy to unit test schemas

---

## Why Zod + React Hook Form?

### Before (Manual Validation)

```typescript
❌ 210 lines of manual validation code
❌ Manual state management
❌ Manual error handling
❌ No type inference
❌ Code duplication
❌ Hard to test

const [formData, setFormData] = useState({...});
const [errors, setErrors] = useState({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.subject.trim()) {
    newErrors.subject = 'Konu alanı gereklidir';
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Açıklama alanı gereklidir';
  } else if (formData.description.trim().length < 10) {
    newErrors.description = 'Açıklama en az 10 karakter olmalıdır';
  }

  // ... 200+ more lines

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### After (React Hook Form + Zod)

```typescript
✅ ~50 lines declarative schema
✅ Automatic state management
✅ Automatic error handling
✅ Full type inference
✅ DRY principle
✅ Easy to test

const ticketSchema = z.object({
  subject: z.string()
    .min(1, 'Konu alanı gereklidir')
    .min(5, 'Konu en az 5 karakter olmalıdır'),
  description: z.string()
    .min(1, 'Açıklama alanı gereklidir')
    .min(10, 'Açıklama en az 10 karakter olmalıdır'),
  // ...
});

const form = useForm({
  resolver: zodResolver(ticketSchema),
});
```

**Result**: 85 lines of code eliminated (-14.7%), 100% type safety achieved.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers
```

Already installed in the project ✅

### 2. Create a Schema

**Location**: `lib/core/validations/[domain].ts`

```typescript
// lib/core/validations/contact.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  message: z
    .string()
    .min(10, 'Mesaj en az 10 karakter olmalıdır')
    .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

### 3. Use in Form Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/core/validations/contact';

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Data is already validated and type-safe
    await api.contact.send(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name')}
        placeholder="İsminiz"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('email')}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <textarea
        {...register('message')}
        placeholder="Mesajınız"
      />
      {errors.message && <span>{errors.message.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </form>
  );
}
```

---

## Creating Validation Schemas

### File Organization

```
lib/core/validations/
├── auth.ts           # Login, register, password reset
├── reviews.ts        # Review creation, editing
├── details.ts        # Proposals, orders, deliveries
├── support.ts        # Tickets, responses
├── profile.ts        # Profile editing (TODO: Sprint 4)
└── search.ts         # Search filters (TODO: Sprint 4)
```

### Basic Schema Structure

```typescript
import { z } from 'zod';

// 1. Define the schema
export const mySchema = z.object({
  fieldName: z.string().min(1, 'Error message'),
  // ...
});

// 2. Export TypeScript type (automatic inference)
export type MyFormData = z.infer<typeof mySchema>;

// 3. Optional: Export validation helper
export const validateMyForm = (data: unknown) => {
  return mySchema.safeParse(data);
};
```

### Common Validations

#### String Validation

```typescript
z.string()
  .min(3, 'En az 3 karakter')
  .max(100, 'En fazla 100 karakter')
  .trim() // Remove whitespace
  .toLowerCase() // Convert to lowercase
  .toUpperCase() // Convert to uppercase
  .email('Geçerli email giriniz')
  .url('Geçerli URL giriniz')
  .regex(/^[A-Z]+$/, 'Sadece büyük harf')
  .startsWith('https://', 'HTTPS gerekli')
  .endsWith('.com', '.com domain gerekli')
  .includes('@', '@ işareti gerekli')
  .length(10, 'Tam 10 karakter olmalı');
```

#### Number Validation

```typescript
z.number()
  .int('Tam sayı olmalı')
  .positive('Pozitif sayı olmalı')
  .negative('Negatif sayı olmalı')
  .nonnegative('0 veya pozitif')
  .nonpositive('0 veya negatif')
  .min(1, 'En az 1')
  .max(100, 'En fazla 100')
  .multipleOf(5, "5'in katı olmalı")
  .safe() // JavaScript safe integer
  .finite(); // Not Infinity or NaN
```

#### Boolean Validation

```typescript
z.boolean().refine((val) => val === true, 'Kabul etmelisiniz');
```

#### Date Validation

```typescript
z.date()
  .min(new Date('2024-01-01'), 'Çok eski tarih')
  .max(new Date('2025-12-31'), 'Çok ileri tarih');
```

#### Array Validation

```typescript
z.array(z.string())
  .nonempty('En az 1 item gerekli')
  .min(2, 'En az 2 item')
  .max(5, 'En fazla 5 item')
  .length(3, 'Tam 3 item olmalı');
```

#### File Validation

```typescript
z.instanceof(File)
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "Dosya 10MB'dan küçük olmalı"
  )
  .refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'Sadece JPEG veya PNG'
  );
```

#### Enum Validation

```typescript
z.enum(['freelancer', 'employer']);
z.nativeEnum(UserType); // For TypeScript enums
```

#### Optional/Nullable Fields

```typescript
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().nullish(); // string | null | undefined
z.string().default('default value');
```

### Advanced Patterns

#### Conditional Validation

```typescript
const schema = z
  .object({
    userType: z.enum(['freelancer', 'employer']),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.userType === 'employer') {
        return !!data.companyName;
      }
      return true;
    },
    {
      message: 'Şirket ismi gereklidir',
      path: ['companyName'],
    }
  );
```

#### Password Confirmation

```typescript
const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });
```

#### Dependent Fields

```typescript
const schema = z
  .object({
    hasDiscount: z.boolean(),
    discountCode: z.string().optional(),
  })
  .refine((data) => !data.hasDiscount || !!data.discountCode, {
    message: 'İndirim kodu gereklidir',
    path: ['discountCode'],
  });
```

#### Transform/Preprocess

```typescript
// Convert string to number
const schema = z.object({
  age: z.string().transform((val) => parseInt(val, 10)),
});

// Trim and lowercase email
const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
```

---

## Using Schemas in Forms

### Basic Usage

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<FormData>({
  resolver: zodResolver(mySchema),
  defaultValues: {
    name: '',
    email: '',
  },
});

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = form;
```

### Form Validation Modes

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur (recommended)
  // mode: 'onChange',    // Validate on every change (aggressive)
  // mode: 'onSubmit',    // Validate only on submit (lenient)
  // mode: 'onTouched',   // Validate after first blur
  // mode: 'all',         // Validate on all events
});
```

### Register Inputs

```typescript
// Simple text input
<input {...register('name')} />

// With additional props
<input
  {...register('email')}
  type="email"
  placeholder="Email adresiniz"
  className="input"
/>

// Textarea
<textarea {...register('message')} rows={5} />

// Checkbox
<input
  {...register('acceptTerms')}
  type="checkbox"
/>

// Select
<select {...register('category')}>
  <option value="">Seçiniz</option>
  <option value="technical">Teknik</option>
</select>

// Radio
<input
  {...register('userType')}
  type="radio"
  value="freelancer"
/>
```

### Manual setValue/watch

```typescript
const { setValue, watch } = form;

// Set value programmatically
setValue('email', 'user@example.com');

// Watch specific field
const emailValue = watch('email');

// Watch all fields
const allValues = watch();

// Watch multiple fields
const [email, name] = watch(['email', 'name']);
```

### Handle Submit

```typescript
const onSubmit = async (data: FormData) => {
  // Data is already validated and type-safe
  try {
    await api.submitForm(data);
    toast.success('Form gönderildi!');
  } catch (error) {
    toast.error('Bir hata oluştu');
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  {/* form fields */}
</form>
```

---

## Error Handling

### Display Errors

```typescript
// Basic error display
{errors.email && (
  <span className="error">{errors.email.message}</span>
)}

// With icon
{errors.email && (
  <div className="error-message">
    <AlertCircle className="icon" />
    <span>{errors.email.message}</span>
  </div>
)}

// Conditional styling
<input
  {...register('email')}
  className={cn(
    'input',
    errors.email && 'input-error'
  )}
/>
```

### Manual Errors

```typescript
const { setError, clearErrors } = form;

// Set custom error
setError('email', {
  type: 'manual',
  message: 'Bu email zaten kullanılıyor',
});

// Clear specific error
clearErrors('email');

// Clear all errors
clearErrors();

// Set multiple errors
setError('root.serverError', {
  type: 'manual',
  message: 'Sunucu hatası oluştu',
});
```

### Global Form Errors

```typescript
const {
  formState: { errors },
  setError,
} = form;

// Set root error
setError('root', {
  message: 'Form gönderilemedi. Lütfen tekrar deneyin.',
});

// Display root error
{errors.root && (
  <div className="alert alert-error">
    {errors.root.message}
  </div>
)}
```

---

## Testing Validations

### Unit Test Schemas

```typescript
import { describe, it, expect } from '@jest/globals';
import { mySchema } from './validations';

describe('MySchema', () => {
  it('should accept valid data', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    expect(() => mySchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalid = {
      name: 'John Doe',
      email: 'not-an-email',
    };

    expect(() => mySchema.parse(invalid)).toThrow();
  });

  it('should reject short name', () => {
    const invalid = {
      name: 'J',
      email: 'john@example.com',
    };

    const result = mySchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('En az 2 karakter');
    }
  });
});
```

See `tests/security/validation.test.ts` for comprehensive examples.

---

## Migration Guide

### Converting Manual Validation to Zod

#### Step 1: Analyze Current Validation

Identify all validation rules in your form:

```typescript
// Current manual validation
const validateForm = (): boolean => {
  if (!formData.subject.trim()) {
    errors.subject = 'Konu alanı gereklidir';
  }
  if (formData.description.length < 10) {
    errors.description = 'Açıklama en az 10 karakter olmalıdır';
  }
  // ...
};
```

#### Step 2: Create Zod Schema

```typescript
// lib/core/validations/myform.ts
import { z } from 'zod';

export const myFormSchema = z.object({
  subject: z.string().min(1, 'Konu alanı gereklidir').trim(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

#### Step 3: Update Component

**Before**:

```typescript
const [formData, setFormData] = useState({...});
const [errors, setErrors] = useState({});

const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  // submit
};
```

**After**:

```typescript
const form = useForm<MyFormData>({
  resolver: zodResolver(myFormSchema),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = form;

const onSubmit = (data: MyFormData) => {
  // submit (data is validated)
};
```

#### Step 4: Update JSX

**Before**:

```typescript
<input
  value={formData.subject}
  onChange={(e) => handleInputChange('subject', e.target.value)}
/>
{errors.subject && <span>{errors.subject}</span>}
```

**After**:

```typescript
<input {...register('subject')} />
{errors.subject && <span>{errors.subject.message}</span>}
```

#### Step 5: Test

- ✅ All fields validate correctly
- ✅ Error messages display
- ✅ Submit works
- ✅ No TypeScript errors

---

## Best Practices

### DO ✅

1. **Centralize schemas** in `lib/core/validations/`
2. **Use TypeScript inference** with `z.infer<>`
3. **Validate on blur** for better UX (`mode: 'onBlur'`)
4. **Add clear error messages** in Turkish
5. **Test validation schemas** with unit tests
6. **Reuse schemas** across components
7. **Use `.trim()` on strings** to remove whitespace
8. **Set default values** in useForm
9. **Handle server errors** with manual setError
10. **Document complex validations** with comments

### DON'T ❌

1. **Don't duplicate validation** logic in multiple places
2. **Don't use Record<string, any>** for types
3. **Don't skip backend validation** (client validation can be bypassed)
4. **Don't forget to handle loading states** (isSubmitting)
5. **Don't use aggressive validation** (onChange) for long forms
6. **Don't hardcode error messages** in JSX
7. **Don't forget to clear errors** after successful submit
8. **Don't mix validation patterns** (use one approach)

---

## Examples

### Complete Form Example

See `components/domains/support/support/TicketForm.tsx` for a complete refactored form.

### Available Schemas

- `lib/core/validations/auth.ts` - Login, register
- `lib/core/validations/reviews.ts` - Reviews
- `lib/core/validations/details.ts` - Proposals, orders
- `lib/core/validations/support.ts` - Tickets (extended example)

---

## Resources

- **Zod Documentation**: https://zod.dev/
- **React Hook Form**: https://react-hook-form.com/
- **Examples**: See Sprint 3 refactored forms

---

**Document Owner**: Frontend Team  
**Review Cycle**: Quarterly  
**Last Review**: October 15, 2025
