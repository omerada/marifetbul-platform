'use client';

import React from 'react';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  Bot,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
  Image,
  FileText,
  File,
} from 'lucide-react';
import { useSupportTicket } from '@/hooks/useSupport';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

interface TicketChatProps {
  ticketId: string;
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
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  isEdited?: boolean;
  replyTo?: string;
}

export const TicketChat: React.FC<TicketChatProps> = ({
  ticketId,
  className,
}) => {
  const { ticket, addResponse, loading } = useSupportTicket(ticketId);
  const { isConnected, sendMessage } = useWebSocket({
    url: `ws://localhost:3001/ws/tickets/${ticketId}/chat`,
    enabled: true,
  });

  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [typingUsers] = React.useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket message handling - simplified for now
  React.useEffect(() => {
    if (!isConnected) return;

    // For now, we'll handle WebSocket messages through the existing useWebSocket hook
    // Real implementation would require message event handling
  }, [isConnected]);

  // Load initial messages from ticket responses
  React.useEffect(() => {
    if (ticket?.responses) {
      const chatMessages: ChatMessage[] = ticket.responses.map((response) => ({
        id: response.id,
        content: response.content,
        author: {
          id: response.author?.id || ticket.user.id,
          name:
            response.author?.role === 'agent'
              ? 'Destek Temsilcisi'
              : `${ticket.user.firstName} ${ticket.user.lastName}`,
          role:
            response.author?.role === 'system'
              ? 'bot'
              : response.author?.role || 'user',
          avatar: response.author?.avatar,
        },
        timestamp: response.createdAt,
        status: 'read' as const,
        attachments: response.attachments,
      }));
      setMessages(chatMessages);
    }
  }, [ticket]);

  const handleSendMessage = async () => {
    if (!message.trim() || !ticket) return;

    const newMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
      author: {
        id: ticket.user.id,
        name: `${ticket.user.firstName} ${ticket.user.lastName}`,
        role: 'user',
      },
      timestamp: new Date().toISOString(),
      status: 'sending',
      replyTo: replyingTo?.id,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    setReplyingTo(null);

    try {
      // Send via WebSocket for real-time (using message type)
      if (isConnected) {
        sendMessage({
          type: 'message',
          data: {
            content: newMessage.content,
            replyTo: newMessage.replyTo,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Also save via API
      await addResponse({
        ticketId: ticket.id,
        content: newMessage.content,
        isPublic: true,
        attachments: [],
      });

      // Update message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
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

  const handleTyping = React.useCallback(() => {
    if (!isConnected) return;

    // Simplified typing indicator using existing types
    sendMessage({
      type: 'typing',
      data: { isTyping: true },
      timestamp: new Date().toISOString(),
    });

    // Stop typing after 3 seconds
    setTimeout(() => {
      sendMessage({
        type: 'typing',
        data: { isTyping: false },
        timestamp: new Date().toISOString(),
      });
    }, 3000);
  }, [isConnected, sendMessage]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // Show error for large files
        return;
      }

      // Handle file upload
      console.log('Uploading file:', file.name);
    });
  };

  const getMessageStatusIcon = (status: ChatMessage['status']) => {
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
      return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isToday = (timestamp: string) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    return today.toDateString() === messageDate.toDateString();
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

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className={cn('flex h-64 items-center justify-center', className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border border-gray-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Bağlantı aktif' : 'Bağlantı yok'}
            </span>
          </div>
        </div>

        <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
            {dayMessages.map((msg, index) => {
              const isCurrentUser = msg.author.role === 'user';
              const showAvatar =
                index === 0 ||
                dayMessages[index - 1]?.author.id !== msg.author.id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {/* Avatar (left side for others) */}
                  {!isCurrentUser && (
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                        showAvatar ? 'visible' : 'invisible'
                      )}
                    >
                      {msg.author.role === 'bot' ? (
                        <Bot className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
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
                    {showAvatar && !isCurrentUser && (
                      <div className="mb-1 px-3 text-xs text-gray-500">
                        {msg.author.name}
                      </div>
                    )}

                    {/* Reply indicator */}
                    {msg.replyTo && (
                      <div className="mb-1 px-3 text-xs text-gray-500">
                        Yanıtlanıyor...
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2',
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : msg.author.role === 'bot'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((attachment, attachIndex) => (
                            <div
                              key={attachIndex}
                              className={cn(
                                'flex items-center gap-2 rounded border p-2',
                                isCurrentUser
                                  ? 'border-blue-500 bg-blue-700'
                                  : 'border-gray-200 bg-white'
                              )}
                            >
                              {getFileIcon(attachment.type)}
                              <span className="text-xs">{attachment.name}</span>
                            </div>
                          ))}
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
                      <span>{formatTime(msg.timestamp)}</span>
                      {isCurrentUser && getMessageStatusIcon(msg.status)}
                      {msg.isEdited && <span>(düzenlendi)</span>}
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
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="rounded-lg bg-gray-100 px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{replyingTo.author.name}</span>{' '}
              kişisine yanıt veriliyor
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 truncate text-sm text-gray-500">
            {replyingTo.content}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              style={{ maxHeight: '120px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Bağlantı koptu. Mesajlar gönderilemiyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketChat;
