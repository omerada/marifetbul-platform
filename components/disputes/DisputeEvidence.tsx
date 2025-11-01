'use client';

import React, { useState } from 'react';
import {
  Upload,
  Loader2,
  FileText,
  ImageIcon,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useDisputeEvidence } from '@/hooks/business/disputes';
import type { DisputeEvidence as DisputeEvidenceType } from '@/types/dispute';

interface DisputeEvidenceProps {
  disputeId: string;
}

export function DisputeEvidence({ disputeId }: DisputeEvidenceProps) {
  const {
    uploadEvidence,
    isUploading,
    uploadError: hookUploadError,
  } = useDisputeEvidence(disputeId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);

  // For now, evidence list is not implemented in the hook
  // In production, you would fetch the evidence list via SWR
  const evidence: DisputeEvidenceType[] = [];
  const isLoading = false;
  const error = null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file size (max 10MB per file)
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setLocalUploadError('Her dosya maksimum 10MB olabilir');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    setLocalUploadError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const success = await uploadEvidence(selectedFiles);
    if (success) {
      setSelectedFiles([]);
      setLocalUploadError(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Kanıtlar yüklenirken bir hata oluştu'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İtiraz Kanıtları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Evidence */}
        {evidence && evidence.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Yüklenen Dosyalar</h4>
            <div className="grid gap-2">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(item.fileType)}
                    <div>
                      <p className="text-sm font-medium">{item.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(item.fileSize)} •{' '}
                        {new Date(item.uploadedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Görüntüle
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <Upload className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-muted-foreground mb-2 text-sm">
              Dosyalarınızı sürükleyip bırakın veya seçin
            </p>
            <p className="text-muted-foreground mb-4 text-xs">
              PNG, JPG, PDF (Maksimum 10MB)
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('evidence-input')?.click()}
            >
              Dosya Seç
            </Button>
            <input
              id="evidence-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">
                Seçilen Dosyalar ({selectedFiles.length})
              </h4>
              <div className="grid gap-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-muted flex items-center justify-between rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Error */}
          {(localUploadError || hookUploadError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {localUploadError || hookUploadError}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFiles.length} Dosya Yükle
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
