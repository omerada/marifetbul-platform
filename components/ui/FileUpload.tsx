import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB cinsinden
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  accept = '*/*',
  multiple = false,
  maxSize = 10,
  maxFiles = 1,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `Dosya boyutu ${maxSize}MB'dan büyük olamaz`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      let errorMessage = '';

      // Dosya sayısı kontrolü
      if (!multiple && fileArray.length > 1) {
        errorMessage = 'Sadece bir dosya seçebilirsiniz';
      } else if (multiple && fileArray.length > maxFiles) {
        errorMessage = `En fazla ${maxFiles} dosya seçebilirsiniz`;
      } else {
        // Her dosyayı doğrula
        for (const file of fileArray) {
          const validation = validateFile(file);
          if (validation) {
            errorMessage = validation;
            break;
          }
          validFiles.push(file);
        }
      }

      if (errorMessage) {
        setError(errorMessage);
        return;
      }

      setError('');
      setSelectedFiles(validFiles);
      onFileSelect(validFiles);
    },
    [multiple, maxFiles, maxSize, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400'} `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          !disabled && document.getElementById('file-upload')?.click()
        }
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
        />

        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-lg font-medium text-gray-900">
          Dosyaları sürükleyip bırakın
        </p>
        <p className="mb-4 text-sm text-gray-500">
          veya dosya seçmek için tıklayın
        </p>
        <p className="text-xs text-gray-400">
          {accept !== '*/*' && `Desteklenen formatlar: ${accept}`}
          {maxSize && ` • Maksimum boyut: ${maxSize}MB`}
          {multiple && ` • Maksimum ${maxFiles} dosya`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Seçilen Dosyalar:
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-red-500 hover:text-red-700"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
