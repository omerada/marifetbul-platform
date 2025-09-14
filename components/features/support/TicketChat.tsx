'use client';

import React from 'react';
import {
  Send,
  Paperclip,
  Smile,
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
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { TicketResponse } from '@/types';
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
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export const TicketChat: React.FC<TicketChatProps> = ({
  ticketId,
  className,
}) => {
  const { ticket, loading: isLoading } = useSupportTicket(ticketId);
  const { isConnected } = useWebSocket();

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

  // Load initial messages from ticket responses
  React.useEffect(() => {
    if (ticket?.responses) {
      const chatMessages: ChatMessage[] = ticket.responses.map(
        (response: TicketResponse) => ({
          id: response.id,
          content: response.content,
          author: {
            id: response.agent?.id || ticket.user?.id || 'unknown',
            name:
              response.agent?.role === 'agent'
                ? 'Destek Temsilcisi'
                : `${ticket.user?.firstName || 'User'} ${ticket.user?.lastName || ''}`,
            role: (response.agent?.role === 'system'
              ? 'bot'
              : response.agent?.role || 'user') as 'user' | 'agent' | 'bot',
            avatar: response.agent?.avatar,
          },
          timestamp: response.createdAt,
          status: 'read' as const,
          attachments:
            response.attachments?.map((att) => ({
              id: att.id || Date.now().toString(),
              name: att.name,
              url: att.url || '',
              type: att.type || 'file',
              size: att.size || 0,
            })) || [],
        })
      );

      setMessages(chatMessages);

      // Add welcome message for the customer
      const customerMessage: ChatMessage = {
        id: 'customer-info',
        content: 'Merhaba! Size nasıl yardımcı olabilirim?',
        author: {
          id: ticket.user?.id || 'customer',
          name: `${ticket.user?.firstName || 'User'} ${ticket.user?.lastName || ''}`,
          role: 'user',
        },
        timestamp: ticket.createdAt,
        status: 'read',
      };

      setMessages((prev) => [customerMessage, ...prev]);
    }
  }, [ticket]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                {msg.author.role === 'bot' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{msg.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-sm">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
