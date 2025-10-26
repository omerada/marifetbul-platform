# 🧪 SPRINT 27 - TESTING GUIDE

## 📋 Overview

This guide provides comprehensive testing procedures for Sprint 27 features: ImageUpload component and PackageAnalytics dashboard.

**Sprint:** 27 - Media Upload & Analytics  
**Features:** ImageUpload, PackageAnalytics, PackageMediaStep Integration  
**Status:** Ready for Testing  
**Last Updated:** October 26, 2025

---

## 🎯 Testing Objectives

### Primary Goals

1. ✅ Verify ImageUpload component works correctly
2. ✅ Ensure package creation with images functions properly
3. ✅ Confirm Cloudinary integration is successful
4. ✅ Validate analytics dashboard displays data
5. ✅ Test error handling and edge cases
6. ✅ Verify responsive design on all devices

### Success Criteria

- All upload scenarios work without errors
- Images display correctly after upload
- Validation catches invalid files
- Error messages are user-friendly
- Analytics data renders properly
- No TypeScript/console errors

---

## 🧪 Test Scenarios

### 1. ImageUpload Component Tests

#### Test 1.1: Basic File Upload

**Steps:**

1. Navigate to package creation (Step 4: Media)
2. Click on the upload area
3. Select a valid JPG image (< 5MB)
4. Wait for upload to complete

**Expected Results:**

- ✅ File selector opens
- ✅ Upload progress indicator appears
- ✅ Image preview displays after upload
- ✅ Image counter updates (1/8)
- ✅ No errors in console

**Test Data:**

- Valid file: `test-image.jpg` (2MB, 1920x1080)

---

#### Test 1.2: Drag & Drop Upload

**Steps:**

1. Navigate to package creation (Step 4: Media)
2. Drag an image file from desktop
3. Drop it on the upload area
4. Wait for upload to complete

**Expected Results:**

- ✅ Drop zone highlights on drag over
- ✅ Drop zone returns to normal on drag leave
- ✅ Upload starts immediately on drop
- ✅ Image preview appears
- ✅ No errors in console

**Test Data:**

- Valid file: `test-package.png` (3MB, 2000x1500)

---

#### Test 1.3: Multiple File Upload

**Steps:**

1. Navigate to package creation (Step 4: Media)
2. Click upload area
3. Select 4 images at once
4. Wait for all uploads to complete

**Expected Results:**

- ✅ All 4 images upload sequentially
- ✅ Progress indicator shows for each
- ✅ All 4 previews display in grid
- ✅ Counter shows 4/8
- ✅ Upload area still visible

**Test Data:**

- `image1.jpg` (1MB)
- `image2.jpg` (2MB)
- `image3.png` (1.5MB)
- `image4.webp` (2.5MB)

---

#### Test 1.4: Maximum Files Limit

**Steps:**

1. Upload 8 images (one at a time or multiple)
2. Try to upload a 9th image

**Expected Results:**

- ✅ First 8 images upload successfully
- ✅ Upload area disappears after 8 images
- ✅ Cannot select more files
- ✅ Counter shows 8/8
- ✅ All 8 previews visible in grid

---

#### Test 1.5: File Type Validation

**Steps:**

1. Try to upload invalid file types:
   - PDF file
   - Word document
   - Video file (MP4)
   - Text file

**Expected Results:**

- ✅ Upload rejected for each invalid type
- ✅ Error message: "Invalid file type. Please upload JPG, PNG, or WebP"
- ✅ No upload attempt made
- ✅ Upload area remains available

---

#### Test 1.6: File Size Validation

**Steps:**

1. Try to upload files over 5MB:
   - 6MB JPG
   - 10MB PNG
   - 15MB WebP

**Expected Results:**

- ✅ Upload rejected for each oversized file
- ✅ Error message: "File too large. Maximum size is 5 MB"
- ✅ No upload attempt made
- ✅ Upload area remains available

---

#### Test 1.7: Image Removal

**Steps:**

1. Upload 3 images
2. Click the X button on the 2nd image
3. Verify removal

**Expected Results:**

- ✅ Image preview removed immediately
- ✅ Counter updates to 2/8
- ✅ Remaining images stay in place
- ✅ Upload area becomes available again
- ✅ No errors in console

---

#### Test 1.8: Upload Progress

**Steps:**

1. Upload a large image (4-5MB)
2. Observe upload progress
3. Wait for completion

**Expected Results:**

- ✅ Spinner appears during upload
- ✅ Uploading state visible
- ✅ Progress completes
- ✅ Preview appears after success
- ✅ Spinner disappears

---

#### Test 1.9: Network Error Handling

**Steps:**

1. Disable internet connection
2. Try to upload an image
3. Observe error handling

**Expected Results:**

- ✅ Upload attempt fails
- ✅ Error message displays
- ✅ User can retry
- ✅ No crash or blank screen
- ✅ Console shows error details

**Note:** Re-enable internet to continue testing

---

#### Test 1.10: Invalid Cloudinary Credentials

**Steps:**

1. Set invalid `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local`
2. Restart dev server
3. Try to upload an image

**Expected Results:**

- ✅ Upload fails with 401/403 error
- ✅ User-friendly error message
- ✅ No exposure of credentials in error
- ✅ Console shows detailed error (for debugging)

**Note:** Fix credentials before continuing

---

### 2. Package Creation Integration Tests

#### Test 2.1: Complete Package Creation Flow

**Steps:**

1. Start new package creation
2. Fill Step 1: Basic Info (title, category, description)
3. Fill Step 2: Tier Pricing (3 tiers)
4. Fill Step 3: Features (list features)
5. Fill Step 4: Media (upload 4 images)
6. Review Step 5: Summary
7. Submit package

**Expected Results:**

- ✅ All steps complete without errors
- ✅ Images included in summary
- ✅ Form submission successful
- ✅ Package created with images
- ✅ Redirect to package detail page

---

#### Test 2.2: Wizard Navigation with Images

**Steps:**

1. Fill steps 1-3
2. Upload 2 images in step 4
3. Click "Previous" to go back to step 3
4. Click "Next" to return to step 4

**Expected Results:**

- ✅ Images still present after navigation
- ✅ Counter still shows 2/8
- ✅ Can upload more images
- ✅ No duplication of images

---

#### Test 2.3: Form Validation with Images

**Steps:**

1. Complete steps 1-3
2. Skip image upload (leave empty)
3. Try to go to step 5 (review)

**Expected Results:**

- ✅ Validation error if images required
- ✅ Error message clear
- ✅ Cannot proceed without images
- ✅ OR proceeds if images optional

---

#### Test 2.4: Save Draft with Images

**Steps:**

1. Fill basic info
2. Upload 3 images
3. Save as draft
4. Reload page / return later
5. Edit draft

**Expected Results:**

- ✅ Draft saved successfully
- ✅ Images preserved in draft
- ✅ Can edit/add/remove images
- ✅ Can complete and publish

---

### 3. PackageAnalytics Dashboard Tests

#### Test 3.1: Dashboard Load

**Steps:**

1. Navigate to dashboard
2. Locate PackageAnalytics section
3. Wait for data to load

**Expected Results:**

- ✅ Loading spinner appears
- ✅ Data loads within 2 seconds (mock data)
- ✅ All metric cards display
- ✅ Chart renders correctly
- ✅ Top packages table populates

---

#### Test 3.2: Metrics Display

**Steps:**

1. View each metric card:
   - Total Packages
   - Total Views
   - Total Orders
   - Total Revenue
   - Average Rating
   - Completion Rate
   - Conversion Rate

**Expected Results:**

- ✅ All metrics show numbers
- ✅ Trend indicators display (↑↓)
- ✅ Colors correct (green=up, red=down)
- ✅ Currency formatted (₺)
- ✅ Percentages show (%)

---

#### Test 3.3: Chart Interaction

**Steps:**

1. View default chart (Views)
2. Click "Orders" button
3. Click "Revenue" button
4. Return to "Views"

**Expected Results:**

- ✅ Chart updates immediately
- ✅ Bars change height
- ✅ Data matches selected metric
- ✅ Button highlights active metric
- ✅ Smooth transition

---

#### Test 3.4: Chart Hover

**Steps:**

1. Hover over each bar in the chart
2. Observe tooltip/title

**Expected Results:**

- ✅ Hover shows data value
- ✅ Date label visible
- ✅ Bar highlights on hover
- ✅ Cursor changes to pointer (if interactive)

---

#### Test 3.5: Top Packages Table

**Steps:**

1. View top packages section
2. Check all data columns:
   - Ranking (1, 2, 3)
   - Title and category
   - Views, Orders, Revenue
   - Rating

**Expected Results:**

- ✅ 3 packages listed
- ✅ All data displayed correctly
- ✅ Ranking visible (colored circles)
- ✅ Numbers formatted
- ✅ Layout aligned

---

#### Test 3.6: Error State

**Steps:**

1. Simulate API error (comment out data generation)
2. Reload dashboard

**Expected Results:**

- ✅ Error message displays
- ✅ Error icon visible
- ✅ "Retry" button available
- ✅ No crash or blank screen
- ✅ Can retry to recover

---

#### Test 3.7: Loading State

**Steps:**

1. Add artificial delay (increase timeout)
2. Reload dashboard
3. Observe loading

**Expected Results:**

- ✅ Spinner appears immediately
- ✅ Loading message clear
- ✅ No layout shift
- ✅ Smooth transition to data

---

### 4. Responsive Design Tests

#### Test 4.1: Mobile View (375px)

**Steps:**

1. Open DevTools
2. Set viewport to iPhone SE (375x667)
3. Test all features

**Expected Results:**

- ✅ Upload area visible and usable
- ✅ Image grid shows 2 columns
- ✅ Analytics cards stack vertically
- ✅ Chart fits screen width
- ✅ Table scrolls horizontally
- ✅ No horizontal overflow

---

#### Test 4.2: Tablet View (768px)

**Steps:**

1. Set viewport to iPad (768x1024)
2. Test all features

**Expected Results:**

- ✅ Image grid shows 3 columns
- ✅ Analytics cards in 2 columns
- ✅ Chart size appropriate
- ✅ Table fits width
- ✅ Touch targets adequate (44px min)

---

#### Test 4.3: Desktop View (1920px)

**Steps:**

1. Set viewport to Full HD (1920x1080)
2. Test all features

**Expected Results:**

- ✅ Image grid shows 4 columns
- ✅ Analytics cards in 4 columns
- ✅ Chart centered and sized well
- ✅ Table readable
- ✅ Layout balanced

---

### 5. Accessibility Tests

#### Test 5.1: Keyboard Navigation

**Steps:**

1. Use Tab key to navigate
2. Use Enter/Space to activate
3. Use Escape to close dialogs

**Expected Results:**

- ✅ All interactive elements focusable
- ✅ Focus indicator visible
- ✅ Tab order logical
- ✅ Enter/Space work
- ✅ Escape closes when applicable

---

#### Test 5.2: Screen Reader

**Steps:**

1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through components
3. Interact with elements

**Expected Results:**

- ✅ All elements announced
- ✅ Labels clear and descriptive
- ✅ States announced (loading, error)
- ✅ Image alt text present
- ✅ Buttons have accessible names

---

#### Test 5.3: Color Contrast

**Steps:**

1. Use browser DevTools or axe extension
2. Check contrast ratios
3. Test with color blindness simulator

**Expected Results:**

- ✅ Text contrast ≥ 4.5:1 (normal)
- ✅ Text contrast ≥ 3:1 (large)
- ✅ Interactive elements ≥ 3:1
- ✅ No reliance on color alone
- ✅ Readable for colorblind users

---

### 6. Performance Tests

#### Test 6.1: Upload Speed

**Steps:**

1. Upload 8 images (total ~20MB)
2. Measure time to complete

**Expected Results:**

- ✅ Each image uploads in < 5 seconds
- ✅ Total time < 1 minute
- ✅ UI remains responsive
- ✅ No freezing or lag

---

#### Test 6.2: Image Rendering

**Steps:**

1. Load page with 8 uploaded images
2. Measure render time
3. Check network tab

**Expected Results:**

- ✅ Thumbnails load quickly
- ✅ Lazy loading works (if implemented)
- ✅ No layout shift
- ✅ Smooth scrolling

---

#### Test 6.3: Dashboard Load Time

**Steps:**

1. Navigate to dashboard
2. Measure time to interactive
3. Check React DevTools profiler

**Expected Results:**

- ✅ Initial load < 1 second
- ✅ Data fetch < 2 seconds
- ✅ Total time < 3 seconds
- ✅ No unnecessary re-renders

---

### 7. Browser Compatibility Tests

#### Test 7.1: Chrome (Latest)

- ✅ All features work
- ✅ Drag & drop works
- ✅ Upload works
- ✅ Charts render

#### Test 7.2: Firefox (Latest)

- ✅ All features work
- ✅ Drag & drop works
- ✅ Upload works
- ✅ Charts render

#### Test 7.3: Safari (Latest)

- ✅ All features work
- ✅ Drag & drop works
- ✅ Upload works
- ✅ Charts render

#### Test 7.4: Edge (Latest)

- ✅ All features work
- ✅ Drag & drop works
- ✅ Upload works
- ✅ Charts render

#### Test 7.5: Mobile Safari (iOS)

- ✅ All features work
- ✅ File picker works
- ✅ Upload works
- ✅ Touch interactions work

#### Test 7.6: Chrome Mobile (Android)

- ✅ All features work
- ✅ File picker works
- ✅ Upload works
- ✅ Touch interactions work

---

## 🐛 Bug Reporting Template

When you find a bug, report it using this template:

```markdown
### Bug Title

[Clear, concise description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**

1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Screenshots:**
[Attach if applicable]

**Environment:**

- Browser: Chrome 119
- OS: Windows 11
- Screen: 1920x1080
- Network: 4G/WiFi

**Console Errors:**
```

[Paste any errors]

```

**Additional Context:**
Any other relevant information
```

---

## ✅ Testing Checklist

### Before Starting Tests

- [ ] Cloudinary account set up
- [ ] Environment variables configured
- [ ] Dev server running (`npm run dev`)
- [ ] Backend running (if needed)
- [ ] Test images prepared (various sizes/types)
- [ ] DevTools open (for console errors)

### ImageUpload Component

- [ ] Test 1.1: Basic file upload
- [ ] Test 1.2: Drag & drop
- [ ] Test 1.3: Multiple files
- [ ] Test 1.4: Maximum limit
- [ ] Test 1.5: Type validation
- [ ] Test 1.6: Size validation
- [ ] Test 1.7: Image removal
- [ ] Test 1.8: Upload progress
- [ ] Test 1.9: Network error
- [ ] Test 1.10: Invalid credentials

### Package Creation Integration

- [ ] Test 2.1: Complete flow
- [ ] Test 2.2: Wizard navigation
- [ ] Test 2.3: Form validation
- [ ] Test 2.4: Save draft

### PackageAnalytics Dashboard

- [ ] Test 3.1: Dashboard load
- [ ] Test 3.2: Metrics display
- [ ] Test 3.3: Chart interaction
- [ ] Test 3.4: Chart hover
- [ ] Test 3.5: Top packages table
- [ ] Test 3.6: Error state
- [ ] Test 3.7: Loading state

### Responsive Design

- [ ] Test 4.1: Mobile (375px)
- [ ] Test 4.2: Tablet (768px)
- [ ] Test 4.3: Desktop (1920px)

### Accessibility

- [ ] Test 5.1: Keyboard navigation
- [ ] Test 5.2: Screen reader
- [ ] Test 5.3: Color contrast

### Performance

- [ ] Test 6.1: Upload speed
- [ ] Test 6.2: Image rendering
- [ ] Test 6.3: Dashboard load time

### Browser Compatibility

- [ ] Test 7.1: Chrome
- [ ] Test 7.2: Firefox
- [ ] Test 7.3: Safari
- [ ] Test 7.4: Edge
- [ ] Test 7.5: Mobile Safari
- [ ] Test 7.6: Chrome Mobile

---

## 📊 Test Results Template

Use this template to record results:

```markdown
## Test Session

**Date:** October 26, 2025
**Tester:** [Your name]
**Duration:** [Time spent]
**Environment:**

- OS: Windows 11
- Browser: Chrome 119
- Screen: 1920x1080

### Results Summary

| Category         | Total  | Passed | Failed | Skipped |
| ---------------- | ------ | ------ | ------ | ------- |
| ImageUpload      | 10     | 9      | 1      | 0       |
| Package Creation | 4      | 4      | 0      | 0       |
| Analytics        | 7      | 7      | 0      | 0       |
| Responsive       | 3      | 3      | 0      | 0       |
| Accessibility    | 3      | 2      | 1      | 0       |
| Performance      | 3      | 3      | 0      | 0       |
| Browser Compat   | 6      | 5      | 0      | 1       |
| **TOTAL**        | **36** | **33** | **2**  | **1**   |

**Pass Rate:** 91.7% (33/36)

### Issues Found

1. [Bug #1 title] - Severity: High
2. [Bug #2 title] - Severity: Medium

### Recommendations

- Fix high-severity bugs before deployment
- Consider accessibility improvements
- Performance is excellent

### Sign-off

✅ **Approved for Deployment** (after bug fixes)

Tester: ******\_\_\_\_******
Date: ********\_\_********
```

---

## 🚀 Deployment Readiness

After completing all tests:

### Pre-Deployment Checklist

- [ ] All critical bugs fixed
- [ ] Pass rate ≥ 95%
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Documentation updated

### Deployment Steps

1. Merge feature branch to `develop`
2. Run full test suite
3. Deploy to staging environment
4. Smoke test in staging
5. Get stakeholder approval
6. Deploy to production
7. Monitor for issues

---

## 📚 Additional Resources

- **Cloudinary Setup Guide:** `docs/CLOUDINARY_SETUP_GUIDE.md`
- **Sprint 27 Summary:** `docs/SPRINT_27_SUMMARY.md`
- **Component Documentation:** `docs/MEDIA_ANALYTICS_SPRINT_27.md`
- **Testing Best Practices:** [testing-library.com](https://testing-library.com)

---

**Document Version:** 1.0  
**Last Updated:** October 26, 2025  
**Author:** MarifetBul Development Team
