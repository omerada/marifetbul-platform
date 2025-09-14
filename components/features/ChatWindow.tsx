'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMessagingStore } from '@/lib/store/messaging';
import useAuthStore from '@/lib/store/auth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Image from 'next/image';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Download,
  Check,
  CheckCheck,
  MoreVertical,
  Reply,
  Edit3,
  Trash2,
  Copy,
  File,
} from 'lucide-react';
import {
  Button,
  Textarea,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { AvatarImage, Avatar, AvatarFallback } from '@/components/ui';
import type { ChatMessage, ChatConversation, MessageAttachment } from '@/types';

interface ChatWindowProps {
  conversation: ChatConversation | null;
  className?: string;
  height?: string;
}

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
}

interface MessageComposerProps {
  conversationId: string;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

interface FileUploadPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

interface TypingIndicatorProps {
  typingUsers: string[];
}

// Simple Message Item Component
const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { editMessage } = useMessagingStore();

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: tr,
    });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;

    if (message.readAt) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  const renderAttachments = (attachments: MessageAttachment[]) => {
    if (!attachments?.length) return null;

    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
          >
            {attachment.type.startsWith('image/') ? (
              <div className="relative">
                <Image
                  src={attachment.url}
                  alt={attachment.name}
                  width={200}
                  height={150}
                  className="max-h-48 max-w-xs rounded object-cover"
                />
              </div>
            ) : (
              <>
                <File className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-sm">{attachment.name}</span>
                <a href={attachment.url} download>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('group flex gap-3', isOwn && 'flex-row-reverse')}>
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn('max-w-[70%] flex-1', isOwn && 'flex flex-col items-end')}
      >
        <div
          className={cn(
            'relative rounded-lg px-3 py-2',
            isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          )}
        >
          {isEditing ? (
            <div className="min-w-[200px]">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mb-2 min-h-[60px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  İptal
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Kaydet
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
              {message.attachments &&
                renderAttachments(message.attachments as never)}
            </>
          )}

          {/* Message actions */}
          <div
            className={cn(
              'absolute top-0 opacity-0 transition-opacity group-hover:opacity-100',
              isOwn ? '-left-10' : '-right-10'
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="mr-2 h-4 w-4" />
                  Yanıtla
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Kopyala
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs text-gray-500',
            isOwn && 'flex-row-reverse'
          )}
        >
          <span>{formatMessageTime(message.sentAt)}</span>
          {getStatusIcon()}
          {message.editedAt && (
            <span className="text-xs text-gray-400">(düzenlendi)</span>
          )}
        </div>
      </div>
    </div>
  );
};

// File Upload Preview Component
const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
  files,
  onRemove,
}) => {
  if (!files.length) return null;

  return (
    <div className="border-t bg-gray-50 p-3">
      <div className="mb-2 text-sm font-medium">Eklenecek dosyalar:</div>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded border bg-white p-2"
          >
            {file.type.startsWith('image/') ? (
              <File className="h-4 w-4 text-green-500" />
            ) : (
              <Paperclip className="h-4 w-4 text-blue-500" />
            )}
            <span className="flex-1 truncate text-sm">{file.name}</span>
            <span className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(index)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (!typingUsers.length) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
      </div>
      <span>
        {typingUsers.length === 1
          ? `${typingUsers[0]} yazıyor...`
          : `${typingUsers.length} kişi yazıyor...`}
      </span>
    </div>
  );
};

// Message Composer Component
const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  replyingTo,
  onCancelReply,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isSendingMessage, setTypingStatus } =
    useMessagingStore();
  const { user } = useAuthStore();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Typing indicator
  useEffect(() => {
    if (!user || disabled) return;

    const isTyping = message.length > 0;
    setTypingStatus({
      conversationId,
      userId: user.id,
      isTyping,
      timestamp: new Date().toISOString(),
    });

    return () => {
      setTypingStatus({
        conversationId,
        userId: user.id,
        isTyping: false,
        timestamp: new Date().toISOString(),
      });
    };
  }, [message, conversationId, user, setTypingStatus, disabled]);

  const handleSendMessage = async () => {
    if ((!message.trim() && !files.length) || isSendingMessage || disabled)
      return;

    const messageData = {
      conversationId,
      content: message.trim(),
      type: files.length > 0 ? ('file' as const) : ('text' as const),
      attachments: files.map((file, index) => ({
        id: `temp-${index}`,
        name: file.name,
        filename: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })),
      replyTo: replyingTo?.id,
    };

    await sendMessage(messageData);

    setMessage('');
    setFiles([]);
    onCancelReply?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white">
      {replyingTo && (
        <div className="flex items-center justify-between border-l-4 border-blue-500 bg-blue-50 px-4 py-2">
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-700">
              Mesaja yanıt veriliyor
            </div>
            <div className="truncate text-sm text-blue-600">
              {replyingTo.content}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <FileUploadPreview files={files} onRemove={removeFile} />

      <div
        className={cn('p-4 transition-colors', isDragging && 'bg-blue-50')}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="h-10 w-10 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dosya ekle</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    className="h-10 w-10 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emoji ekle</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              disabled={disabled}
              className="max-h-[120px] min-h-[40px] w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={1}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={
              (!message.trim() && !files.length) || isSendingMessage || disabled
            }
            size="sm"
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};

// Main Chat Window Component
export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  className,
  height = '600px',
}) => {
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoadingMessages,
    loadMessages,
    markMessagesAsRead,
    deleteMessage,
    typingStatuses,
    onlineUsers,
  } = useMessagingStore();

  const { user } = useAuthStore();

  // Memoize conversation messages to prevent unnecessary re-renders
  const conversationMessages = useMemo(
    () => (conversation ? messages[conversation.id] || [] : []),
    [conversation, messages]
  );

  const conversationTypingUsers = conversation
    ? typingStatuses
        .filter(
          (t) =>
            t.conversationId === conversation.id &&
            t.isTyping &&
            t.userId !== user?.id
        )
        .map((t) => t.userId)
    : [];

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      loadMessages(conversation.id);
    }
  }, [conversation?.id, loadMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages.length]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversation?.id && conversationMessages.length > 0) {
      const hasUnreadMessages = conversationMessages.some(
        (m) => m.senderId !== user?.id && !m.readAt
      );

      if (hasUnreadMessages) {
        markMessagesAsRead(conversation.id);
      }
    }
  }, [conversation?.id, conversationMessages, user?.id, markMessagesAsRead]);

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      await deleteMessage(messageId);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  if (!conversation) {
    return (
      <div
        className={cn('flex items-center justify-center bg-gray-50', className)}
        style={{ height }}
      >
        <div className="text-center">
          <div className="mb-2 text-lg text-gray-500">Konuşma seçin</div>
          <div className="text-sm text-gray-400">
            Mesajlaşmaya başlamak için bir konuşma seçin
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== user?.id
  );
  const isOnline =
    otherParticipant && otherParticipant.userId
      ? onlineUsers.includes(otherParticipant.userId)
      : false;

  return (
    <div
      className={cn('flex flex-col rounded-lg border bg-white', className)}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={otherParticipant?.user?.avatar || ''}
            alt={`${otherParticipant?.user?.firstName || ''} ${otherParticipant?.user?.lastName || ''}`}
          />
          <AvatarFallback>
            {otherParticipant?.user?.firstName?.slice(0, 2).toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">
            {otherParticipant?.user?.firstName || ''}{' '}
            {otherParticipant?.user?.lastName || ''}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isOnline ? 'bg-green-500' : 'bg-gray-300'
              )}
            />
            <span className="text-sm text-gray-500">
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>
        </div>

        {conversation.orderId && (
          <Badge variant="secondary">Sipariş: #{conversation.orderId}</Badge>
        )}
      </div>

      {/* Messages */}
      <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1 overflow-auto">
        <div className="space-y-4 p-4">
          {isLoadingMessages && conversationMessages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500" />
            </div>
          ) : conversationMessages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Henüz mesaj yok. İlk mesajı göndererek konuşmayı başlatın!
            </div>
          ) : (
            <>
              {conversationMessages.map((message, index) => {
                const isOwn = message.senderId === user?.id;
                const prevMessage = conversationMessages[index - 1];
                const showAvatar =
                  !prevMessage || prevMessage.senderId !== message.senderId;

                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    onReply={handleReply}
                    onDelete={handleDelete}
                  />
                );
              })}
            </>
          )}

          <TypingIndicator typingUsers={conversationTypingUsers} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Composer */}
      <MessageComposer
        conversationId={conversation.id}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        disabled={isLoadingMessages}
      />
    </div>
  );
};

export default ChatWindow;
