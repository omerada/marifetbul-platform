/**
 * ConversationListHeader Component
 *
 * Header for conversation list with real-time connection status,
 * unread count, and search functionality.
 *
 * @sprint Sprint 1 - Story 1.3
 */

'use client';

import { memo } from 'react';
import { Search, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ConversationListHeaderProps {
  /** Total number of conversations */
  totalConversations: number;
  /** Number of unread conversations */
  unreadCount: number;
  /** WebSocket connection status */
  isConnected: boolean;
  /** Search query value */
  searchQuery: string;
  /** Search query change handler */
  onSearchChange: (query: string) => void;
  /** Show search input */
  showSearch?: boolean;
}

/**
 * ConversationListHeader Component
 */
export const ConversationListHeader = memo(function ConversationListHeader({
  totalConversations,
  unreadCount,
  isConnected,
  searchQuery,
  onSearchChange,
  showSearch = true,
}: ConversationListHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>

          {/* Real-time connection indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Bağlı</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">Bağlantı kesildi</span>
              </>
            )}
          </div>
        </div>

        {/* Unread Count */}
        {totalConversations > 0 && (
          <div className="text-sm">
            {unreadCount > 0 ? (
              <span className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white">
                {unreadCount} okunmamış
              </span>
            ) : (
              <span className="text-gray-600">
                {totalConversations} konuşma
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      {showSearch && totalConversations > 0 && (
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Konuşmalarda ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>
  );
});
