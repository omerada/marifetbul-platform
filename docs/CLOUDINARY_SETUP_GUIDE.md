# ☁️ CLOUDINARY SETUP GUIDE

## 📋 Overview

This guide walks you through setting up Cloudinary for the MarifetBul platform's image upload functionality. Cloudinary provides cloud-based image and video management with automatic optimization, transformation, and CDN delivery.

---

## 🎯 Why Cloudinary?

**Benefits:**

- ✅ **Free Tier:** 25GB storage + 25GB bandwidth/month
- ✅ **Automatic Optimization:** WebP conversion, quality adjustment
- ✅ **CDN Delivery:** Fast global content delivery
- ✅ **Transformations:** Resize, crop, filters on-the-fly
- ✅ **Direct Upload:** Browser → Cloudinary (no backend needed)
- ✅ **Easy Integration:** Simple API, great documentation
- ✅ **Thumbnails:** Generate any size via URL parameters

**Use Cases in MarifetBul:**

- Package images (up to 8 per package)
- Portfolio images
- User profile pictures
- Blog post images
- Message attachments

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Account (2 min)

1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with email or Google account
3. Verify your email
4. Complete the onboarding wizard (skip if you want)

### Step 2: Get Credentials (1 min)

1. Login to [console.cloudinary.com](https://console.cloudinary.com)
2. Go to **Dashboard**
3. Copy these values:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456
   ```

### Step 3: Create Upload Preset (2 min)

1. Go to **Settings** (gear icon top right)
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   ```
   Preset name: marifetbul_packages
   Signing Mode: Unsigned
   Folder: marifetbul/packages
   Use filename: No
   Unique filename: Yes
   Overwrite: No
   Resource type: Image
   Access mode: Public
   ```
6. Click **Save**
7. Copy the preset name: `marifetbul_packages`

### Step 4: Configure Environment Variables

1. Open your `.env.local` file
2. Add these values:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=marifetbul_packages
   ```
3. Restart your Next.js dev server
4. Test upload in package creation

---

## 📖 Detailed Setup

### Account Configuration

#### 1. Account Settings

Go to **Settings > Account**:

- **Account name:** Your account identifier
- **Cloud name:** Used in upload URLs (cannot change later)
- **Plan:** Free tier (can upgrade later)
- **Storage:** Monitor usage (25GB limit)
- **Bandwidth:** Monitor monthly transfer (25GB limit)

#### 2. Security Settings

Go to **Settings > Security**:

**Enable:**

- ✅ **Strict transformations:** Prevent unauthorized transformations
- ✅ **Secure URLs:** Optional - for signed delivery URLs
- ✅ **Rate limiting:** Prevent abuse

**Disable:**

- ❌ **Restrict media types:** Allow JPG, PNG, WebP
- ❌ **Block public uploads:** We need unsigned uploads

### Upload Preset Configuration

#### Why Upload Presets?

Upload presets define upload rules without exposing API secrets. They enable secure unsigned uploads directly from the browser.

#### Creating Presets for Each Entity

**1. Package Images Preset:**

```yaml
Preset Name: marifetbul_packages
Signing Mode: Unsigned
Folder: marifetbul/packages
Use filename: No
Unique filename: Yes
Overwrite: No
Resource Type: Image
Access Mode: Public
Allowed Formats: JPG, PNG, WebP
Max File Size: 10 MB
Transformations:
  - Auto quality
  - Auto format (WebP preferred)
```

**2. Portfolio Images Preset:**

```yaml
Preset Name: marifetbul_portfolios
Signing Mode: Unsigned
Folder: marifetbul/portfolios
Use filename: No
Unique filename: Yes
Overwrite: No
Resource Type: Image
Access Mode: Public
Allowed Formats: JPG, PNG, WebP
Max File Size: 10 MB
```

**3. Profile Pictures Preset:**

```yaml
Preset Name: marifetbul_profiles
Signing Mode: Unsigned
Folder: marifetbul/profiles
Use filename: No
Unique filename: Yes
Overwrite: Yes
Resource Type: Image
Access Mode: Public
Allowed Formats: JPG, PNG, WebP
Max File Size: 5 MB
Transformations:
  - Resize: 500x500 (crop, fill)
  - Face detection: Center
```

**4. Blog Images Preset:**

```yaml
Preset Name: marifetbul_blog
Signing Mode: Unsigned
Folder: marifetbul/blog
Use filename: No
Unique filename: Yes
Overwrite: No
Resource Type: Image
Access Mode: Public
Allowed Formats: JPG, PNG, WebP, GIF
Max File Size: 10 MB
```

### Folder Structure

Organize uploads by entity type:

```
marifetbul/
├── packages/          # Package images
│   ├── featured/      # Featured/cover images
│   └── gallery/       # Gallery images
├── portfolios/        # Portfolio work samples
├── profiles/          # User avatars
│   ├── users/         # Regular users
│   └── companies/     # Company logos
├── blog/              # Blog post images
├── messages/          # Message attachments
└── temp/              # Temporary uploads (auto-delete)
```

**Benefits:**

- Easy to browse in Cloudinary console
- Simple backup/migration
- Clear usage analytics per entity
- Easy to set different rules per folder

### Transformation Presets

Configure common transformations:

#### 1. Thumbnail (Small)

```
Name: thumb_small
Width: 150
Height: 150
Crop: fill
Gravity: auto
Quality: auto
Format: auto
```

**URL Example:**

```
https://res.cloudinary.com/your-cloud-name/image/upload/c_fill,g_auto,h_150,w_150/marifetbul/packages/abc123.jpg
```

#### 2. Thumbnail (Medium)

```
Name: thumb_medium
Width: 300
Height: 300
Crop: fill
Gravity: auto
Quality: auto
Format: auto
```

#### 3. Card Image

```
Name: card
Width: 400
Height: 300
Crop: fill
Gravity: auto
Quality: auto:good
Format: auto
```

#### 4. Full Size (Optimized)

```
Name: full
Width: 1200
Height: 800
Crop: limit
Quality: auto:good
Format: auto
```

---

## 🔧 Integration with MarifetBul

### Frontend Integration

#### 1. ImageUpload Component

Already configured in `components/shared/ImageUpload.tsx`:

```tsx
import { ImageUpload } from '@/components/shared/ImageUpload';

function PackageCreation() {
  const [images, setImages] = useState([]);

  return (
    <ImageUpload
      maxImages={8}
      maxFileSize={5 * 1024 * 1024}
      value={images}
      onChange={setImages}
      uploadPreset="marifetbul_packages"
      folder="marifetbul/packages"
      showPreview={true}
    />
  );
}
```

#### 2. Upload Flow

```
1. User selects/drops files
   ↓
2. Frontend validates (type, size)
   ↓
3. Upload to Cloudinary (unsigned)
   POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
   FormData: { file, upload_preset, folder }
   ↓
4. Cloudinary processes
   - Store original
   - Generate WebP
   - Create thumbnails
   ↓
5. Return URLs
   {
     secure_url: "https://res.cloudinary.com/.../abc123.jpg",
     public_id: "marifetbul/packages/abc123"
   }
   ↓
6. Save URL to database
```

#### 3. Display Images

```tsx
// Original size (Cloudinary auto-optimizes)
<img src={imageUrl} alt="Package" />

// Custom size with transformation
<img
  src={imageUrl.replace('/upload/', '/upload/w_400,h_300,c_fill/')}
  alt="Package"
/>

// With Next.js Image (recommended)
<Image
  src={imageUrl}
  width={400}
  height={300}
  alt="Package"
  unoptimized // Cloudinary already optimizes
/>
```

### Backend Integration

Already configured in `marifetbul-backend`:

#### 1. Configuration

**File:** `CloudinaryConfig.java`

```java
@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}
```

#### 2. Service

**File:** `CloudinaryImageService.java`

```java
@Service
public class CloudinaryImageService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        Map<String, Object> params = ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "image",
            "transformation", new Transformation()
                .width(1200).height(800).crop("limit")
                .quality("auto:good")
                .fetchFormat("auto")
        );

        Map uploadResult = cloudinary.uploader()
            .upload(file.getBytes(), params);

        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String publicId) {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
```

#### 3. Application Properties

**File:** `application.yml`

```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:your-cloud-name}
  api-key: ${CLOUDINARY_API_KEY:your-api-key}
  api-secret: ${CLOUDINARY_API_SECRET:your-api-secret}
```

---

## 📊 Usage Monitoring

### Dashboard Metrics

Go to **Dashboard** to monitor:

1. **Storage:** Current usage / 25GB limit
2. **Bandwidth:** Monthly transfer / 25GB limit
3. **Transformations:** Credits used / 25 credits limit
4. **Requests:** API calls per month

### Usage Optimization Tips

**Storage:**

- Delete unused images regularly
- Use auto-delete for temporary files
- Compress before upload (optional)

**Bandwidth:**

- Use CDN caching (automatic)
- Enable auto-format (WebP)
- Use appropriate image sizes

**Transformations:**

- Cache transformed URLs
- Use named transformations
- Avoid dynamic transformations in loops

**Requests:**

- Implement client-side caching
- Use signed URLs for sensitive content
- Batch delete operations

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit:**

```bash
# ❌ DON'T
CLOUDINARY_API_SECRET=abc123xyz

# ✅ DO
CLOUDINARY_API_SECRET=******************
```

**Use .gitignore:**

```
.env.local
.env.production
```

### 2. Upload Presets

**Unsigned uploads (for public content):**

- ✅ Packages, portfolios, blog images
- ✅ Rate limited by Cloudinary
- ✅ Folder restrictions

**Signed uploads (for sensitive content):**

- ✅ Profile pictures (with validation)
- ✅ Documents (private content)
- ✅ Backend validation required

### 3. Validation

**Frontend validation:**

```typescript
// File type
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// File size
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

**Backend validation:**

```java
// Always validate on backend too
if (!isValidImageType(file)) {
    throw new ValidationException("Invalid image type");
}

if (file.getSize() > MAX_FILE_SIZE) {
    throw new ValidationException("File too large");
}
```

### 4. Rate Limiting

**Cloudinary automatic:**

- 500 requests/hour (free tier)
- Temporary block on abuse

**Application-level:**

```typescript
// Implement debouncing
const debouncedUpload = debounce(uploadImage, 1000);

// Limit concurrent uploads
const MAX_CONCURRENT = 3;
const uploadQueue = new PQueue({ concurrency: MAX_CONCURRENT });
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Upload Fails (401 Unauthorized)

**Problem:** Invalid credentials

**Solution:**

- Verify cloud name in `.env.local`
- Check upload preset name
- Ensure preset is set to "Unsigned"

#### 2. Upload Fails (403 Forbidden)

**Problem:** Folder restrictions

**Solution:**

- Check upload preset folder settings
- Verify folder path in code
- Ensure unsigned upload is enabled

#### 3. Image Not Displaying

**Problem:** Invalid URL or access denied

**Solution:**

- Check URL format: `https://res.cloudinary.com/...`
- Verify image is public
- Check CORS settings in Cloudinary

#### 4. Slow Upload

**Problem:** Large file size or network

**Solution:**

- Compress images before upload
- Check internet connection
- Use smaller file sizes (max 5MB)
- Enable upload progress UI

#### 5. Storage Limit Reached

**Problem:** Free tier limit (25GB)

**Solution:**

- Delete unused images
- Clean up test uploads
- Upgrade plan if needed
- Implement auto-delete for temp files

### Debug Mode

Enable detailed logging:

```typescript
// In ImageUpload.tsx
const uploadToCloudinary = async (file: File) => {
  console.log('Uploading:', file.name, file.size, file.type);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  console.log('FormData:', {
    file: file.name,
    upload_preset: uploadPreset,
    folder: folder,
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    console.log('Upload response:', data);

    if (!response.ok) {
      console.error('Upload failed:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

---

## 📚 Additional Resources

### Official Documentation

- **Getting Started:** [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Upload API:** [cloudinary.com/documentation/upload_images](https://cloudinary.com/documentation/upload_images)
- **Transformations:** [cloudinary.com/documentation/image_transformations](https://cloudinary.com/documentation/image_transformations)
- **Node.js SDK:** [cloudinary.com/documentation/node_integration](https://cloudinary.com/documentation/node_integration)
- **React Integration:** [cloudinary.com/documentation/react_integration](https://cloudinary.com/documentation/react_integration)

### Video Tutorials

- **Cloudinary in 5 Minutes:** [youtube.com/watch?v=...](https://www.youtube.com/results?search_query=cloudinary+tutorial)
- **Upload Presets:** [cloudinary.com/blog/...](https://cloudinary.com/blog)
- **Image Optimization:** [cloudinary.com/blog/...](https://cloudinary.com/blog)

### Community

- **Stack Overflow:** [stackoverflow.com/questions/tagged/cloudinary](https://stackoverflow.com/questions/tagged/cloudinary)
- **Discord Community:** [cloudinary.com/community](https://cloudinary.com/community)
- **GitHub Issues:** [github.com/cloudinary/cloudinary_npm](https://github.com/cloudinary/cloudinary_npm)

---

## ✅ Checklist

Before deploying to production:

- [ ] Created Cloudinary account
- [ ] Copied cloud name, API key, API secret
- [ ] Created upload preset: `marifetbul_packages`
- [ ] Set preset to "Unsigned"
- [ ] Configured folder: `marifetbul/packages`
- [ ] Added credentials to `.env.local`
- [ ] Restarted Next.js dev server
- [ ] Tested image upload in package creation
- [ ] Verified image displays correctly
- [ ] Checked Cloudinary dashboard for uploaded image
- [ ] Tested image deletion
- [ ] Reviewed usage limits
- [ ] Set up monitoring alerts (optional)

---

## 🎉 Summary

You've successfully set up Cloudinary for MarifetBul! Your platform can now:

- ✅ Upload images directly from browser
- ✅ Store images in the cloud (25GB free)
- ✅ Deliver via global CDN
- ✅ Automatically optimize for web
- ✅ Generate thumbnails on-the-fly
- ✅ Transform images via URL

**Next Steps:**

1. Test upload flow in package creation
2. Monitor usage in Cloudinary dashboard
3. Configure additional presets for portfolios, profiles
4. Set up automatic cleanup for old images

**Need Help?**

- Check troubleshooting section above
- Contact Cloudinary support: support@cloudinary.com
- Review official documentation: cloudinary.com/documentation

---

**Document Version:** 1.0  
**Last Updated:** October 26, 2025  
**Author:** MarifetBul Development Team
