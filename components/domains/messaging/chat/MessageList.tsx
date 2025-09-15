'use client';

import React from 'react';
import Image from 'next/image';
import {
  User,
  Bot,
  Clock,
  Check,
  CheckCheck,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  File,
  MoreVertical,
  Copy,
  Reply,
  Forward,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageListProps {
  conversationId: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: 'user' | 'agent' | 'bot';
    avatar?: string;
  };
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'image' | 'system' | 'quick_reply';
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    thumbnail?: string;
  }[];
  replyTo?: {
    id: string;
    content: string;
    author: string;
  };
  quickReplies?: {
    id: string;
    text: string;
    value: string;
  }[];
  isEdited?: boolean;
  editedAt?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  className,
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMessage, setSelectedMessage] = React.useState<string | null>(
    null
  );
  const [showActions, setShowActions] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  React.useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock messages
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            content: 'Merhaba! Size nasıl yardımcı olabilirim?',
            author: {
              id: 'bot-1',
              name: 'Marifet Asistanı',
              role: 'bot',
            },
            timestamp: new Date(Date.now() - 60000).toISOString(),
            status: 'read',
            type: 'text',
          },
          {
            id: '2',
            content: 'Hesabımla ilgili bir sorunum var. Giriş yapamıyorum.',
            author: {
              id: 'user-1',
              name: 'Ahmet Yılmaz',
              role: 'user',
            },
            timestamp: new Date(Date.now() - 45000).toISOString(),
            status: 'read',
            type: 'text',
          },
          {
            id: '3',
            content:
              'Giriş sorunuzla ilgili yardımcı olabilirim. Size birkaç soru sormam gerekiyor:',
            author: {
              id: 'agent-1',
              name: 'Ayşe Demir',
              role: 'agent',
            },
            timestamp: new Date(Date.now() - 30000).toISOString(),
            status: 'read',
            type: 'text',
            quickReplies: [
              { id: '1', text: 'Şifremi unuttum', value: 'forgot_password' },
              {
                id: '2',
                text: 'E-mail doğrulaması',
                value: 'email_verification',
              },
              { id: '3', text: 'Hesap bloke', value: 'account_blocked' },
            ],
          },
          {
            id: '4',
            content: 'İşte hata ekran görüntüsü:',
            author: {
              id: 'user-1',
              name: 'Ahmet Yılmaz',
              role: 'user',
            },
            timestamp: new Date(Date.now() - 15000).toISOString(),
            status: 'read',
            type: 'image',
            attachments: [
              {
                id: 'att-1',
                name: 'error-screenshot.png',
                url: '/images/error-screenshot.png',
                type: 'image/png',
                size: 245760,
                thumbnail: '/images/error-screenshot-thumb.png',
              },
            ],
          },
          {
            id: '5',
            content:
              'Teşekkürler, görüntüyü inceliyorum. Bu durumu daha önce gördük ve çözümü var.',
            author: {
              id: 'agent-1',
              name: 'Ayşe Demir',
              role: 'agent',
            },
            timestamp: new Date(Date.now() - 5000).toISOString(),
            status: 'read',
            type: 'text',
          },
        ];

        setMessages(mockMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const handleMessageAction = (action: string, messageId: string) => {
    switch (action) {
      case 'copy':
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          navigator.clipboard.writeText(message.content);
        }
        break;
      case 'reply':
        // Handle reply
        console.log('Reply to message:', messageId);
        break;
      case 'forward':
        // Handle forward
        console.log('Forward message:', messageId);
        break;
      case 'delete':
        // Handle delete
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        break;
    }
    setShowActions(null);
  };

  const handleQuickReply = (value: string, messageId: string) => {
    // Handle quick reply selection
    console.log('Quick reply selected:', value, 'for message:', messageId);

    // Remove quick replies from the message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, quickReplies: undefined } : msg
      )
    );
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const messageDate = new Date(dateStr);
    return today.toDateString() === messageDate.toDateString();
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className={cn('flex h-64 items-center justify-center', className)}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className={cn('flex-1 space-y-4 overflow-y-auto p-4', className)}
    >
      {Object.entries(messageGroups).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {isToday(date)
                ? 'Bugün'
                : new Date(date).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {/* Messages for this date */}
          {dayMessages.map((message, index) => {
            const isCurrentUser = message.author.role === 'user';
            const showAvatar =
              index === 0 ||
              dayMessages[index - 1]?.author.id !== message.author.id;
            const showName = showAvatar && !isCurrentUser;

            return (
              <div
                key={message.id}
                className={cn(
                  'group flex gap-3',
                  isCurrentUser ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Avatar (left side for others) */}
                {!isCurrentUser && (
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100',
                      showAvatar ? 'visible' : 'invisible'
                    )}
                  >
                    {message.author.role === 'bot' ? (
                      <Bot className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-xs lg:max-w-md',
                    isCurrentUser ? 'order-1' : ''
                  )}
                >
                  {/* Author name */}
                  {showName && (
                    <div className="mb-1 px-3 text-xs text-gray-500">
                      {message.author.name}
                      {message.author.role === 'agent' && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                          Destek
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-2 px-3">
                      <div className="rounded border-l-4 border-gray-400 bg-gray-100 p-2">
                        <div className="text-xs font-medium text-gray-600">
                          {message.replyTo.author} yanıtlanıyor
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {message.replyTo.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      'relative rounded-lg px-3 py-2',
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : message.author.role === 'bot'
                          ? 'bg-gray-100 text-gray-900'
                          : 'border border-gray-200 bg-white text-gray-900',
                      selectedMessage === message.id && 'ring-2 ring-blue-500'
                    )}
                    onClick={() =>
                      setSelectedMessage(
                        selectedMessage === message.id ? null : message.id
                      )
                    }
                  >
                    {/* Message content */}
                    {message.type === 'text' && (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}

                    {message.type === 'system' && (
                      <p className="text-xs text-gray-500 italic">
                        {message.content}
                      </p>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id}>
                            {attachment.type.startsWith('image/') ? (
                              <div className="relative">
                                <Image
                                  src={attachment.thumbnail || attachment.url}
                                  alt={attachment.name}
                                  width={300}
                                  height={200}
                                  className="h-auto max-w-full cursor-pointer rounded border transition-opacity hover:opacity-90"
                                  onClick={() =>
                                    window.open(attachment.url, '_blank')
                                  }
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(attachment.url, '_blank');
                                    }}
                                    className="bg-opacity-50 hover:bg-opacity-70 rounded bg-black p-1 text-white transition-opacity"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle download
                                    }}
                                    className="bg-opacity-50 hover:bg-opacity-70 rounded bg-black p-1 text-white transition-opacity"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'flex items-center justify-between rounded border p-3',
                                  isCurrentUser
                                    ? 'border-blue-500 bg-blue-700'
                                    : 'border-gray-200 bg-gray-50'
                                )}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  {getFileIcon(attachment.type)}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                      {attachment.name}
                                    </p>
                                    <p className="text-xs opacity-75">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      window.open(attachment.url, '_blank')
                                    }
                                    className="hover:bg-opacity-20 rounded p-1 transition-colors hover:bg-black"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Handle download
                                    }}
                                    className="hover:bg-opacity-20 rounded p-1 transition-colors hover:bg-black"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick replies */}
                    {message.quickReplies &&
                      message.quickReplies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500">
                            Hızlı yanıt seçin:
                          </p>
                          <div className="space-y-1">
                            {message.quickReplies.map((reply) => (
                              <button
                                key={reply.id}
                                onClick={() =>
                                  handleQuickReply(reply.value, message.id)
                                }
                                className="bg-opacity-20 border-opacity-30 hover:bg-opacity-30 block w-full rounded border border-white bg-white p-2 text-left text-xs transition-colors"
                              >
                                {reply.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Message actions button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(
                          showActions === message.id ? null : message.id
                        );
                      }}
                      className="absolute -top-2 right-2 rounded-full bg-gray-100 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreVertical className="h-3 w-3 text-gray-500" />
                    </button>

                    {/* Message actions menu */}
                    {showActions === message.id && (
                      <div className="absolute top-6 right-0 z-10 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          onClick={() =>
                            handleMessageAction('copy', message.id)
                          }
                          className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Copy className="h-3 w-3" />
                          Kopyala
                        </button>
                        <button
                          onClick={() =>
                            handleMessageAction('reply', message.id)
                          }
                          className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Reply className="h-3 w-3" />
                          Yanıtla
                        </button>
                        <button
                          onClick={() =>
                            handleMessageAction('forward', message.id)
                          }
                          className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Forward className="h-3 w-3" />
                          İlet
                        </button>
                        {isCurrentUser && (
                          <button
                            onClick={() =>
                              handleMessageAction('delete', message.id)
                            }
                            className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Sil
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message info */}
                  <div
                    className={cn(
                      'mt-1 flex items-center gap-1 text-xs text-gray-500',
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    {isCurrentUser && getStatusIcon(message.status)}
                    {message.isEdited && (
                      <span className="text-gray-400">(düzenlendi)</span>
                    )}
                  </div>
                </div>

                {/* Avatar (right side for current user) */}
                {isCurrentUser && (
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600',
                      showAvatar ? 'visible' : 'invisible'
                    )}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
