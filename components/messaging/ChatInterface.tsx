'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Message, FileAttachment } from '@/types';
import { Card, Button, Loading, FileUpload } from '@/components/ui';
import {
  useConversation,
  useMessages,
  useMessaging,
} from '@/hooks/useMessages';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ALLOWED_FILE_TYPES,
  formatFileSize,
  getFileIcon,
} from '@/lib/utils/fileUpload';
import { useToast } from '@/hooks';

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

  const [messageText, setMessageText] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get other participant
  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== currentUser.id
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
    if ((!messageText.trim() && pendingFiles.length === 0) || sendingMessage)
      return;

    try {
      // For now, we'll send the message with text only
      // In a real implementation, files would be included in the message
      const content = messageText.trim() || '[Dosya gönderildi]';
      await sendMessage(conversationId, content);

      setMessageText('');
      setPendingFiles([]);
      refreshMessages();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Mesaj gönderilemedi');
    }
  };

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const handleRemoveFile = (fileId: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleFileUploadError = (error: string) => {
    console.error('File upload error:', error);
    toast.error('Dosya yükleme hatası');
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

          {/* Project Info */}
          {(conversation.jobId || conversation.packageId) && (
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
                Eklenecek dosyalar:
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((file) => (
                  <div
                    key={file.id}
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
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-500 hover:text-red-700"
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
                onFilesUploaded={handleFilesUploaded}
                onError={handleFileUploadError}
                options={{
                  allowedTypes: ALLOWED_FILE_TYPES.all,
                  maxFiles: 3,
                  multiple: true,
                }}
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
                sendingMessage
              }
              className="mb-2"
            >
              {sendingMessage ? (
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
