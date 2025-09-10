'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Conversation } from '@/types';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { useConversations } from '@/hooks/useMessages';
import {
  MessageCircle,
  Search,
  Plus,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MessagesListProps {
  user: User;
}

export function MessagesList({ user }: MessagesListProps) {
  const { conversations, isLoading, error } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== user.id
    );
    if (!otherParticipant) return false;

    const searchString =
      `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Mesajlar yüklenemedi
        </h3>
        <p className="mb-4 text-gray-600">
          Bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
        </p>
        <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
      </Card>
    );
  }

  if (!conversations.length) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Henüz mesajınız yok
        </h3>
        <p className="mb-6 text-gray-600">
          {user.userType === 'freelancer'
            ? 'İş tekliflerinizi gönderin ve müşterilerle iletişim kurun.'
            : 'Freelancerlarla iletişim kurmak için iş ilanı verin veya hizmet satın alın.'}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/marketplace">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              {user.userType === 'freelancer'
                ? 'İş İlanlarını Keşfet'
                : 'Freelancerları Keşfet'}
            </Button>
          </Link>
          {user.userType === 'employer' && (
            <Link href="/jobs/create">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                İş İlanı Ver
              </Button>
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Konuşmalarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </Card>

      {/* Conversations List */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">
              Arama kriterlerinize uygun konuşma bulunamadı.
            </p>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              currentUser={user}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ConversationCardProps {
  conversation: Conversation;
  currentUser: User;
}

function ConversationCard({
  conversation,
  currentUser,
}: ConversationCardProps) {
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );

  if (!otherParticipant) return null;

  const isUnread = conversation.unreadCount > 0;
  const lastMessage = conversation.lastMessage;

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card
        className={`cursor-pointer p-4 transition-all hover:bg-gray-50 hover:shadow-md ${
          isUnread ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
              {otherParticipant.avatar ? (
                <Image
                  src={otherParticipant.avatar}
                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            {isUnread && (
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                <span className="text-xs font-bold text-white">
                  {conversation.unreadCount > 9
                    ? '9+'
                    : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3
                  className={`truncate text-sm font-medium ${
                    isUnread ? 'text-gray-900' : 'text-gray-800'
                  }`}
                >
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </h3>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  {otherParticipant.userType === 'freelancer'
                    ? 'Freelancer'
                    : 'İşveren'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {lastMessage && (
                  <>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                    {lastMessage.senderId === currentUser.id && (
                      <div className="flex items-center">
                        {lastMessage.isRead ? (
                          <CheckCircle2 className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Eye className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {lastMessage && (
              <p
                className={`mt-1 truncate text-sm ${
                  isUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                }`}
              >
                {lastMessage.senderId === currentUser.id && 'Sen: '}
                {lastMessage.content}
              </p>
            )}

            {/* Project Info */}
            {(conversation.jobId || conversation.packageId) && (
              <div className="mt-2 flex items-center space-x-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {conversation.jobId ? 'İş projesi' : 'Hizmet paketi'} hakkında
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
