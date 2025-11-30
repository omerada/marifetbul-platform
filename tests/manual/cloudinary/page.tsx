/**
 * Cloudinary Test Page
 * Test image upload functionality
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { toast } from 'sonner';
import {
  uploadImage,
  isCloudinaryConfigured,
  getConfigStatus,
  getThumbnailUrl,
  extractPublicId,
  getOptimizedUrl,
} from '@/lib/utils/cloudinary';
import { Upload, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

export default function CloudinaryTestPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [publicId, setPublicId] = useState<string>('');

  const configStatus = getConfigStatus();
  const isConfigured = isCloudinaryConfigured();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading('Görsel yükleniyor...', { id: 'test-upload' });

    try {
      const result = await uploadImage(file);

      if (result.success && result.url) {
        setUploadedUrl(result.url);
        setPublicId(result.publicId || '');
        toast.success('Görsel başarıyla yüklendi!', { id: 'test-upload' });
      } else {
        toast.error(result.error || 'Yükleme başarısız', { id: 'test-upload' });
      }
    } catch (error) {
      toast.error('Hata oluştu', { id: 'test-upload' });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cloudinary Test</h1>
        <p className="text-muted-foreground mt-2">
          Test image upload functionality with Cloudinary
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <ImageIcon className="h-5 w-5" />
          Configuration Status
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Configured:</span>
            <span className="flex items-center gap-2">
              {isConfigured ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Yes</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">No</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Cloud Name:</span>
            <span className="text-muted-foreground">
              {configStatus.cloudName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Upload Preset:</span>
            <span className="text-muted-foreground">
              {configStatus.uploadPreset}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">API Key:</span>
            <span className="text-muted-foreground">{configStatus.apiKey}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">API Secret:</span>
            <span className="text-muted-foreground">
              {configStatus.apiSecret}
            </span>
          </div>
        </div>

        {!isConfigured && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium">⚠️ Configuration Required</p>
            <p className="mt-2">
              Please add the following environment variables to{' '}
              <code className="rounded bg-yellow-100 px-1 py-0.5">
                .env.local
              </code>
              :
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-yellow-100 p-2 text-xs">
              {`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret`}
            </pre>
          </div>
        )}
      </Card>

      {/* Upload Test */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Upload className="h-5 w-5" />
          Upload Test
        </h2>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || !isConfigured}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>

          {uploadedUrl && (
            <div className="space-y-4">
              {/* Original Image */}
              <div>
                <h3 className="mb-2 font-medium">Original Image:</h3>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="rounded-lg border border-gray-200"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <p className="mt-2 text-xs break-all text-gray-500">
                  {uploadedUrl}
                </p>
              </div>

              {/* Public ID */}
              {publicId && (
                <div>
                  <h3 className="mb-2 font-medium">Public ID:</h3>
                  <code className="block rounded bg-gray-100 p-2 text-sm">
                    {publicId}
                  </code>
                  <p className="mt-2 text-xs text-gray-500">
                    Extracted: {extractPublicId(uploadedUrl)}
                  </p>
                </div>
              )}

              {/* Transformations */}
              <div>
                <h3 className="mb-2 font-medium">Transformations:</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Thumbnail */}
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Thumbnail (150x150):
                    </p>
                    <img
                      src={getThumbnailUrl(uploadedUrl, 150)}
                      alt="Thumbnail"
                      className="rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* Small */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Small (300px):</p>
                    <img
                      src={getOptimizedUrl(uploadedUrl, {
                        width: 300,
                        quality: 'auto',
                        format: 'auto',
                      })}
                      alt="Small"
                      className="rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* Medium */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Medium (600px):</p>
                    <img
                      src={getOptimizedUrl(uploadedUrl, {
                        width: 600,
                        quality: 'auto',
                        format: 'auto',
                      })}
                      alt="Medium"
                      className="rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* WebP */}
                  <div>
                    <p className="mb-2 text-sm font-medium">WebP Format:</p>
                    <img
                      src={getOptimizedUrl(uploadedUrl, {
                        width: 300,
                        quality: 'auto',
                        format: 'webp',
                      })}
                      alt="WebP"
                      className="rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Setup Instructions</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          <li>
            Sign up for a free Cloudinary account at{' '}
            <a
              href="https://cloudinary.com/users/register/free"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              cloudinary.com
            </a>
          </li>
          <li>
            Get your credentials from the{' '}
            <a
              href="https://console.cloudinary.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Cloudinary Console
            </a>
          </li>
          <li>
            Create an upload preset:
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Go to Settings → Upload</li>
              <li>Click &quot;Add upload preset&quot;</li>
              <li>Set signing mode to &quot;Unsigned&quot;</li>
              <li>Set folder to &quot;marifetbul/portfolios&quot;</li>
              <li>Enable unique filename</li>
              <li>Save and copy the preset name</li>
            </ul>
          </li>
          <li>
            Add credentials to <code>.env.local</code> file
          </li>
          <li>Restart development server</li>
          <li>Test upload on this page</li>
        </ol>
      </Card>
    </div>
  );
}
