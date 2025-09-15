'use client';

import React from 'react';
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useWebSocket } from '@/hooks';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  autoOpen?: boolean;
  showWelcomeMessage?: boolean;
  allowFileUpload?: boolean;
  allowVoiceCall?: boolean;
  allowVideoCall?: boolean;
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
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface ChatSession {
  id: string;
  isActive: boolean;
  agent?: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'busy' | 'offline';
  };
  waitTime?: number;
  queuePosition?: number;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  className,
  position = 'bottom-right',
  theme = 'auto',
  autoOpen = false,
  showWelcomeMessage = true,
  allowFileUpload = true,
  allowVoiceCall = false,
  allowVideoCall = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:3001/ws/chat',
    enabled: isAuthenticated,
  });

  const [isOpen, setIsOpen] = React.useState(autoOpen);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [session] = React.useState<ChatSession | null>(null);
  const [isTyping] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  React.useEffect(() => {
    if (isOpen && showWelcomeMessage && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        content:
          'Merhaba! Size nasıl yardımcı olabilirim? Sorunuzı yazın ve size en kısa sürede yanıt verelim.',
        author: {
          id: 'bot-1',
          name: 'Marifet Asistanı',
          role: 'bot',
        },
        timestamp: new Date().toISOString(),
        status: 'read',
        type: 'text',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, showWelcomeMessage, messages.length]);

  // Reset unread count when widget is opened
  React.useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'bg-gray-900 text-white border-gray-700';
    } else if (theme === 'light') {
      return 'bg-white text-gray-900 border-gray-200';
    }
    // Auto theme - defaults to light
    return 'bg-white text-gray-900 border-gray-200';
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !isAuthenticated) return;

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: currentMessage.trim(),
      author: {
        id: user?.id || 'anonymous',
        name: user ? `${user.firstName} ${user.lastName}` : 'Kullanıcı',
        role: 'user',
      },
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'text',
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessage('');

    try {
      if (isConnected) {
        sendMessage({
          type: 'message',
          data: {
            content: newMessage.content,
            sessionId: session?.id,
          },
          timestamp: newMessage.timestamp,
        });
      }

      // Update message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Simulate bot response for demo
      if (!session?.agent) {
        setTimeout(() => {
          const botResponse: ChatMessage = {
            id: `bot-${Date.now()}`,
            content:
              'Mesajınız alındı. Bir temsilci en kısa sürede size dönüş yapacaktır.',
            author: {
              id: 'bot-1',
              name: 'Marifet Asistanı',
              role: 'bot',
            },
            timestamp: new Date().toISOString(),
            status: 'read',
            type: 'text',
          };
          setMessages((prev) => [...prev, botResponse]);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sending' } : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !allowFileUpload) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large');
        return;
      }

      const fileMessage: ChatMessage = {
        id: `file-${Date.now()}`,
        content: `📎 ${file.name}`,
        author: {
          id: user?.id || 'anonymous',
          name: user ? `${user.firstName} ${user.lastName}` : 'Kullanıcı',
          role: 'user',
        },
        timestamp: new Date().toISOString(),
        status: 'sending',
        type: 'file',
        attachments: [
          {
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
            size: file.size,
          },
        ],
      };

      setMessages((prev) => [...prev, fileMessage]);
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <div className={cn('fixed z-50', getPositionClasses(), className)}>
        <button
          onClick={() => setIsOpen(true)}
          className="relative rounded-full bg-blue-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 w-80 overflow-hidden rounded-lg shadow-2xl transition-all duration-200 sm:w-96',
        getPositionClasses(),
        getThemeClasses(),
        isMinimized ? 'h-16' : 'h-96 sm:h-[500px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-opacity-20 flex h-8 w-8 items-center justify-center rounded-full bg-white">
            {session?.agent ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">
              {session?.agent ? session.agent.name : 'Canlı Destek'}
            </h3>
            <p className="text-xs text-blue-100">
              {isConnected ? (
                session?.agent ? (
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    Çevrimiçi
                  </span>
                ) : (
                  'Bağlanıyor...'
                )
              ) : (
                'Bağlantı yok'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allowVoiceCall && (
            <button className="hover:bg-opacity-20 rounded p-2 transition-colors hover:bg-white">
              <Phone className="h-4 w-4" />
            </button>
          )}
          {allowVideoCall && (
            <button className="hover:bg-opacity-20 rounded p-2 transition-colors hover:bg-white">
              <Video className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-opacity-20 rounded p-2 transition-colors hover:bg-white"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-opacity-20 rounded p-2 transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Queue Status */}
          {session?.queuePosition && session.queuePosition > 0 && (
            <div className="border-b border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Sırada {session.queuePosition}. pozisyondasınız.
                  {session.waitTime &&
                    ` Tahmini bekleme süresi: ${session.waitTime} dakika`}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-64 flex-1 space-y-3 overflow-y-auto p-4 sm:h-80">
            {messages.map((message) => {
              const isCurrentUser = message.author.role === 'user';

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isCurrentUser && (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      {message.author.role === 'bot' ? (
                        <Bot className="h-3 w-3 text-blue-600" />
                      ) : (
                        <User className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                  )}

                  <div
                    className={cn('max-w-xs', isCurrentUser ? 'order-1' : '')}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm',
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className={cn(
                                  'flex items-center gap-2 rounded border p-2 text-xs',
                                  isCurrentUser
                                    ? 'border-blue-500 bg-blue-700'
                                    : 'border-gray-200 bg-white'
                                )}
                              >
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div
                      className={cn(
                        'mt-1 flex items-center gap-1 text-xs text-gray-500',
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {isCurrentUser && getStatusIcon(message.status)}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                  <Bot className="h-3 w-3 text-blue-600" />
                </div>
                <div className="rounded-lg bg-gray-100 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 animate-bounce rounded-full bg-gray-400" />
                    <div
                      className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  rows={1}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  style={{ maxHeight: '80px' }}
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="flex items-center gap-1">
                {allowFileUpload && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                      disabled={!isAuthenticated}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  </>
                )}

                <button
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                  disabled={!isAuthenticated}
                >
                  <Smile className="h-4 w-4" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !isAuthenticated}
                  className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isAuthenticated && (
              <p className="mt-2 text-xs text-gray-500">
                Mesaj göndermek için lütfen giriş yapın.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
