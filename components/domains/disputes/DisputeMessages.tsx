/**
 * ================================================
 * DISPUTE MESSAGES COMPONENT
 * ================================================
 * Sprint 1 - Day 3.1: Real-time messaging for disputes
 *
 * Features:
 * - Real-time chat interface
 * - Message history with auto-scroll
 * - File attachment support
 * - Typing indicators
 * - Participant role badges
 * - Message timestamps
 * - Empty states
 * - Loading states
 *
 * @note Backend API endpoints pending implementation:
 *   - GET /api/v1/disputes/{id}/messages
 *   - POST /api/v1/disputes/{id}/messages
 *   - POST /api/v1/disputes/{id}/messages/attachments
 *   - WebSocket /ws/disputes/{id}/messages
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Dispute System
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  X,
  FileIcon,
  ImageIcon,
  User,
  Shield,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { logger } from '@/lib/shared/utils/logger';
import type { DisputeMessage } from '@/types/dispute';

// ================================================
// TYPES
// ================================================

interface DisputeMessagesProps {
  disputeId: string;
  currentUserId: string;
  currentUserRole: 'BUYER' | 'SELLER' | 'ADMIN';
  className?: string;
}

interface ExtendedDisputeMessage extends DisputeMessage {
  isSending?: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getRoleBadgeColor(role: 'BUYER' | 'SELLER' | 'ADMIN'): {
  bg: string;
  text: string;
} {
  switch (role) {
    case 'ADMIN':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'BUYER':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'SELLER':
      return { bg: 'bg-green-100', text: 'text-green-700' };
  }
}

function getRoleLabel(role: 'BUYER' | 'SELLER' | 'ADMIN'): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'BUYER':
      return 'Alıcı';
    case 'SELLER':
      return 'Satıcı';
  }
}

function getRoleIcon(role: 'BUYER' | 'SELLER' | 'ADMIN') {
  switch (role) {
    case 'ADMIN':
      return Shield;
    case 'BUYER':
    case 'SELLER':
      return User;
  }
}

// ================================================
// MOCK API (Replace with real API when backend is ready)
// ================================================

async function fetchDisputeMessages(
  disputeId: string
): Promise<ExtendedDisputeMessage[]> {
  // TODO: Replace with actual API call when backend implements endpoint
  // return apiClient.get<DisputeMessage[]>(`/api/v1/disputes/${disputeId}/messages`);

  // Mock data for development
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      disputeId,
      userId: 'user-buyer-123',
      userFullName: 'Ahmet Yılmaz',
      userRole: 'BUYER',
      message:
        'Merhaba, siparişimle ilgili ciddi bir sorun var. Gönderilen paket beklediğim gibi değil.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isDelivered: true,
      isRead: true,
    },
    {
      id: '2',
      disputeId,
      userId: 'user-seller-456',
      userFullName: 'Mehmet Demir',
      userRole: 'SELLER',
      message:
        'Merhaba, siparişi tam olarak tanımlandığı şekilde gönderdim. Neden memnun kalmadığınızı detaylı açıklayabilir misiniz?',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      isDelivered: true,
      isRead: true,
    },
    {
      id: '3',
      disputeId,
      userId: 'admin-789',
      userFullName: 'Destek Ekibi',
      userRole: 'ADMIN',
      message:
        'Merhaba, itirazınızı inceliyoruz. Lütfen sorunu detaylandırın ve varsa kanıt ekleyin.',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isDelivered: true,
      isRead: true,
    },
  ];
}

async function sendDisputeMessage(
  disputeId: string,
  message: string,
  attachments?: File[]
): Promise<ExtendedDisputeMessage> {
  // TODO: Replace with actual API call when backend implements endpoint
  // const formData = new FormData();
  // formData.append('message', message);
  // attachments?.forEach(file => formData.append('attachments', file));
  // return apiClient.post<DisputeMessage>(`/api/v1/disputes/${disputeId}/messages`, formData);

  // Mock response for development
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    id: `msg-${Date.now()}`,
    disputeId,
    userId: 'current-user-id', // Would come from auth context
    userFullName: 'Siz',
    userRole: 'ADMIN', // Would come from auth context
    message,
    attachments: attachments?.map((file) => file.name),
    createdAt: new Date().toISOString(),
    isSending: false,
    isDelivered: true,
    isRead: false,
  };
}

// ================================================
// COMPONENT
// ================================================

export default function DisputeMessages({
  disputeId,
  currentUserId,
  currentUserRole,
  className = '',
}: DisputeMessagesProps) {
  const [messages, setMessages] = useState<ExtendedDisputeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await fetchDisputeMessages(disputeId);
        setMessages(fetchedMessages);
      } catch (error) {
        logger.error('Failed to fetch dispute messages:', error);
        toast.error('Mesajlar yüklenemedi', {
          description: 'Mesajlar yüklenirken bir hata oluştu.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [disputeId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    setIsSending(true);

    // Optimistic update
    const tempMessage: ExtendedDisputeMessage = {
      id: `temp-${Date.now()}`,
      disputeId,
      userId: currentUserId,
      userFullName: 'Siz',
      userRole: currentUserRole,
      message: messageText,
      attachments: attachments.map((file) => file.name),
      createdAt: new Date().toISOString(),
      isSending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessageText('');
    setAttachments([]);

    try {
      const sentMessage = await sendDisputeMessage(
        disputeId,
        messageText,
        attachments
      );

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? sentMessage : msg))
      );

      toast.success('Mesaj gönderildi');
    } catch (error) {
      logger.error('Failed to send message:', error);
      toast.error('Mesaj gönderilemedi', {
        description: 'Lütfen tekrar deneyin.',
      });

      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [messageText, attachments, disputeId, currentUserId, currentUserRole]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error('Dosya çok büyük', {
          description: `${file.name} 10MB'dan büyük olamaz.`,
        });
        return false;
      }
      return true;
    });

    // Limit to 5 files
    const totalFiles = attachments.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error('Çok fazla dosya', {
        description: 'Maksimum 5 dosya ekleyebilirsiniz.',
      });
      setAttachments((prev) => [...prev, ...validFiles].slice(0, 5));
    } else {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <Loading size="md" text="Mesajlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-200 p-6">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Henüz mesaj yok
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Bu itirazda henüz mesajlaşma başlamadı.
              <br />
              İlk mesajı gönderin.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUserId;
              const RoleIcon = getRoleIcon(message.userRole);
              const roleBadge = getRoleBadgeColor(message.userRole);

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${roleBadge.bg}`}
                  >
                    <RoleIcon className={`h-5 w-5 ${roleBadge.text}`} />
                  </div>

                  {/* Message Content */}
                  <div
                    className={`max-w-md flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                  >
                    {/* Header */}
                    <div
                      className={`mb-1 flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {message.userFullName}
                      </span>
                      <Badge
                        className={`${roleBadge.bg} ${roleBadge.text} text-xs`}
                      >
                        {getRoleLabel(message.userRole)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`inline-block rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>

                      {/* Attachments */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 rounded p-2 ${
                                  isOwnMessage
                                    ? 'bg-purple-700'
                                    : 'border border-gray-200 bg-gray-50'
                                }`}
                              >
                                <FileIcon className="h-4 w-4" />
                                <span className="truncate text-xs">
                                  {attachment}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Status Indicators */}
                      {isOwnMessage && (
                        <div className="mt-1 flex items-center justify-end gap-1">
                          {message.isSending && (
                            <Clock className="h-3 w-3 animate-pulse text-purple-200" />
                          )}
                          {message.isDelivered && !message.isRead && (
                            <Check className="h-3 w-3 text-purple-200" />
                          )}
                          {message.isRead && (
                            <CheckCheck className="h-3 w-3 text-purple-200" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <span>Yazıyor...</span>
          </div>
        )}
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="border-t bg-white p-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                ) : (
                  <FileIcon className="h-4 w-4 text-gray-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          {/* File Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || attachments.length >= 5}
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın... (Enter: Gönder, Shift+Enter: Yeni satır)"
              disabled={isSending}
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:bg-gray-100"
              style={{ maxHeight: '150px' }}
            />
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={
              isSending || (!messageText.trim() && attachments.length === 0)
            }
            className="flex-shrink-0"
          >
            {isSending ? <Loading size="sm" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500">
          Maksimum 5 dosya (10MB/dosya). Desteklenen formatlar: resim, PDF,
          Word, TXT
        </p>
      </div>
    </div>
  );
}
