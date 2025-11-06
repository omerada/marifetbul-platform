'use client';

import { useState, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface ConversationSearchRequest {
  query?: string;
  contextType?: string;
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ConversationSearchResult {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  contextType?: string;
  contextData?: Record<string, unknown>;
}

export interface ConversationSearchResponse {
  content: ConversationSearchResult[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function useConversationSearch() {
  const [results, setResults] = useState<ConversationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const search = useCallback(
    async (
      searchRequest: ConversationSearchRequest,
      page: number = 0,
      size: number = 20
    ) => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/conversations/search?page=${page}&size=${size}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: searchRequest.query,
              contextType: searchRequest.contextType,
              unreadOnly: searchRequest.unreadOnly,
              startDate: searchRequest.startDate?.toISOString(),
              endDate: searchRequest.endDate?.toISOString(),
              sortBy: searchRequest.sortBy || 'lastMessageAt',
              sortDirection: searchRequest.sortDirection || 'desc',
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to search conversations');
        }

        const data = await response.json();
        const searchResponse: ConversationSearchResponse = data.data;

        setResults(searchResponse.content);
        setTotalResults(searchResponse.totalElements);
        setCurrentPage(searchResponse.pageNumber);
        setHasMore(searchResponse.hasNext);

        return searchResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Search failed';
        logger.error('Conversation search error:', err instanceof Error ? err : new Error(String(err)));
        setError(errorMessage);
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setCurrentPage(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    totalResults,
    currentPage,
    hasMore,
    search,
    clearResults,
  };
}
