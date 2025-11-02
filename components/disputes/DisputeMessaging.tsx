'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2, Paperclip, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { useDisputeMessages } from '@/hooks/business/disputes';
import { addMessageSchema } from '@/lib/validation/dispute-validation';

interface DisputeMessagingProps {
  disputeId: string;
}

interface MessageFormData {
  message: string;
  attachments?: File[];
}

export function DisputeMessaging({ disputeId }: DisputeMessagingProps) {
  const { messages, isLoading, error, sendMessage, isSending } =
    useDisputeMessages(disputeId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MessageFormData>({
    resolver: zodResolver(addMessageSchema),
  });

  const onSubmit = async (data: MessageFormData) => {
    // For now, we don't support file attachments in messages
    // In production, you would upload files first and get URLs
    const success = await sendMessage(data.message);
    if (success) {
      reset();
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getRoleBadgeVariant = (
    role: string
  ): 'default' | 'secondary' | 'destructive' => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'SELLER':
        return 'default';
      case 'BUYER':
        return 'secondary';
      default:
        return 'default';
    }
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
              {error.message || 'Mesajlar yüklenirken bir hata oluştu'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İtiraz Mesajları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="bg-muted/50 flex flex-col gap-2 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {message.senderFullName || 'System'}
                    </span>
                    <Badge variant={getRoleBadgeVariant(message.senderRole)}>
                      {message.senderRole === 'ADMIN'
                        ? 'Admin'
                        : message.senderRole === 'SELLER'
                          ? 'Satıcı'
                          : message.senderRole === 'BUYER'
                            ? 'Alıcı'
                            : 'Sistem'}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.attachmentUrls &&
                  message.attachmentUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachmentUrls.map(
                        (attachment: string, idx: number) => (
                          <a
                            key={idx}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-1 text-xs hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            Ek {idx + 1}
                          </a>
                        )
                      )}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              Henüz mesaj bulunmuyor
            </div>
          )}
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Textarea
              placeholder="Mesajınızı yazın..."
              rows={3}
              className={errors.message ? 'border-red-500' : ''}
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* File Attachments */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-muted flex items-center gap-2 rounded-md px-3 py-1 text-sm"
                >
                  <Paperclip className="h-3 w-3" />
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Dosya Ekle
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button type="submit" size="sm" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
