'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Message } from '@/types';
import { Card, Button, Loading, FileUpload } from '@/components/ui';
import {
  useConversation,
  useMessages,
  useMessaging,
  useMessageAttachments,
  type MessageAttachment,
} from '@/hooks';
import {
  ArrowLeft,
  Send,
  User as UserIcon,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCircle2,
  Eye,
  X,
  Package,
  FileText,
  Briefcase,
  Box,
  ShoppingCart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ALLOWED_FILE_TYPES,
  formatFileSize,
  getFileIcon,
  validateFiles,
} from '@/lib/shared/utils';
import { useToast } from '@/hooks';
import { logger } from '@/lib/shared/utils/logger';
import type { ContextType } from '@/types/business/features/messaging';

/**
 * Get icon and label for context type
 */
function getContextInfo(contextType: ContextType) {
  switch (contextType) {
    case 'ORDER':
      return {
        icon: ShoppingCart,
        label: 'Sipariş',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'PROPOSAL':
      return {
        icon: FileText,
        label: 'Teklif',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'JOB':
      return {
        icon: Briefcase,
        label: 'İş İlanı',
        color: 'bg-green-50 text-green-700 border-green-200',
      };
    case 'PACKAGE':
      return {
        icon: Box,
        label: 'Paket',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    default:
      return {
        icon: Package,
        label: 'Genel',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
      };
  }
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUser: User;
}

export function ChatInterface({
  conversationId,
  currentUser,
}: ChatInterfaceProps) {
  const toast = useToast();
  const { conversation, isLoading: conversationLoading } =
    useConversation(conversationId);
  const {
    messages,
    isLoading: messagesLoading,
    refresh: refreshMessages,
  } = useMessages(conversationId);
  const { sendMessage, markAsRead, isLoading: sendingMessage } = useMessaging();
  const { uploadFiles, isUploading } = useMessageAttachments();

  const [messageText, setMessageText] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get other participant ID and participant object
  const otherParticipantId = conversation?.participantIds?.find(
    (id) => id !== currentUser.id
  );

  const otherParticipant =
    conversation?.participants?.find(
      (participant) => participant.userId === otherParticipantId
    ) ||
    conversation?.participants?.find(
      (participant) => participant.id === otherParticipantId // Fallback for MSW compatibility
    );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markAsRead(conversationId);
    }
  }, [conversation, conversationId, markAsRead]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (
      (!messageText.trim() && pendingFiles.length === 0) ||
      sendingMessage ||
      isUploading
    )
      return;

    try {
      let attachment: MessageAttachment | undefined;

      // Upload files if there are pending files (we support only 1 attachment per message for now)
      if (pendingFiles.length > 0) {
        toast.info('Dosyalar yükleniyor...');
        const uploadedFiles = await uploadFiles(pendingFiles);

        if (uploadedFiles.length > 0) {
          attachment = uploadedFiles[0]; // Take the first file

          // If multiple files, we'll send them as separate messages
          if (uploadedFiles.length > 1) {
            toast.info(
              `${uploadedFiles.length} dosya ayrı mesajlar olarak gönderiliyor...`
            );

            // Send additional files as separate messages
            for (let i = 1; i < uploadedFiles.length; i++) {
              const file = uploadedFiles[i];
              await sendMessage(conversationId, {
                content: `📎 ${file.filename}`,
                attachment: {
                  url: file.url,
                  name: file.filename,
                  size: file.size,
                  type: file.mimeType,
                },
              });
            }
          }
        }
      }

      // Prepare message content
      let content = messageText.trim();
      if (!content && attachment) {
        content = `📎 ${attachment.filename}`;
      }

      // Send main message with first attachment
      await sendMessage(conversationId, {
        content,
        ...(attachment && {
          attachment: {
            url: attachment.url,
            name: attachment.filename,
            size: attachment.size,
            type: attachment.mimeType,
          },
        }),
      });

      // Reset state
      setMessageText('');
      setPendingFiles([]);
      setShowFileUpload(false);
      refreshMessages();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      toast.success('Mesaj gönderildi');
    } catch (error) {
      logger.error('Failed to send message:', error);
      toast.error('Mesaj gönderilemedi');
    }
  };

  const handleFilesUploaded = (files: File[]) => {
    const validation = validateFiles(files, {
      maxFiles: 3,
      maxSizeInMB: 10,
      allowedTypes: ALLOWED_FILE_TYPES,
    });

    if (validation.errors.length > 0) {
      validation.errors.forEach((error: string) => toast.error(error));
      return;
    }

    // Add valid files (File objects, not FileAttachments yet)
    const availableSlots = 3 - pendingFiles.length;
    const filesToAdd = files.slice(0, availableSlots);

    setPendingFiles((prev) => [...prev, ...filesToAdd]);
    setShowFileUpload(false);

    if (filesToAdd.length > 0) {
      toast.success(`${filesToAdd.length} dosya eklendi`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (conversationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Konuşma yükleniyor..." />
      </div>
    );
  }

  if (!conversation || !otherParticipant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Konuşma bulunamadı
          </h3>
          <p className="mb-4 text-gray-600">
            Bu konuşmaya erişim izniniz yok veya konuşma mevcut değil.
          </p>
          <Link href="/messages">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Mesajlara Dön
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                  {otherParticipant.avatar ? (
                    <Image
                      src={otherParticipant.avatar}
                      alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  )}
                </div>

                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {otherParticipant.userType === 'freelancer'
                      ? 'Freelancer'
                      : 'İşveren'}
                    {otherParticipant.location &&
                      ` • ${otherParticipant.location}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Context Info Badge */}
          {conversation.contextType && conversation.contextId && (
            <div className="mt-3 flex items-center gap-2">
              {(() => {
                const contextInfo = getContextInfo(conversation.contextType);
                const ContextIcon = contextInfo.icon;
                return (
                  <div
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${contextInfo.color}`}
                  >
                    <ContextIcon className="h-4 w-4" />
                    <span>{contextInfo.label}</span>
                    {conversation.contextData?.title && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="font-normal">
                          {conversation.contextData.title}
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Legacy Project Info - Keep for backward compatibility */}
          {!conversation.contextType &&
            (conversation.jobId || conversation.packageId) && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  💼 {conversation.jobId ? 'İş projesi' : 'Hizmet paketi'}{' '}
                  hakkında konuşuyorsunuz
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading text="Mesajlar yükleniyor..." />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Card className="p-6 text-center">
                <p className="text-gray-600">
                  Henüz mesaj yok. İlk mesajı gönderin!
                </p>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUser.id}
                  showAvatar={
                    index === 0 ||
                    messages[index - 1].senderId !== message.senderId
                  }
                  showTimestamp={
                    index === messages.length - 1 ||
                    messages[index + 1].senderId !== message.senderId ||
                    new Date(messages[index + 1].createdAt).getTime() -
                      new Date(message.createdAt).getTime() >
                      300000 // 5 minutes
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Pending Files */}
          {pendingFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Eklenecek dosyalar ({pendingFiles.length}/3):
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2"
                  >
                    <span className="text-sm">{getFileIcon(file.type)}</span>
                    <span className="max-w-[150px] truncate text-sm text-gray-700">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {showFileUpload && (
            <div className="mb-3">
              <FileUpload
                onFileSelect={handleFilesUploaded}
                accept={ALLOWED_FILE_TYPES.join(',')}
                multiple={true}
                maxFiles={3}
                maxSize={10}
              />
            </div>
          )}

          <div className="flex items-end space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="max-h-32 min-h-[44px] w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                rows={1}
              />
            </div>

            <Button variant="ghost" size="sm" className="mb-2">
              <Smile className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={
                (!messageText.trim() && pendingFiles.length === 0) ||
                sendingMessage ||
                isUploading
              }
              className="mb-2"
              title={isUploading ? 'Dosyalar yükleniyor...' : 'Mesaj gönder'}
            >
              {sendingMessage || isUploading ? (
                <Loading size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}
      >
        {/* Avatar */}
        <div className="h-8 w-8 flex-shrink-0">
          {showAvatar && !isOwn && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              {message.sender?.avatar ? (
                <Image
                  src={message.sender.avatar}
                  alt={message.sender.name || 'User'}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-gray-600" />
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'border border-gray-200 bg-white text-gray-900'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>

          {showTimestamp && (
            <div
              className={`mt-1 flex items-center justify-between space-x-2 ${
                isOwn ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <span
                className={`text-xs ${
                  isOwn ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>

              {isOwn && (
                <div className="flex items-center">
                  {message.isRead ? (
                    <CheckCircle2 className="h-3 w-3 text-blue-200" />
                  ) : (
                    <Eye className="h-3 w-3 text-blue-300" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
