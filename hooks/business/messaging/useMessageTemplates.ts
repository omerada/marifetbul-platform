import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  MessageTemplate,
  ContextType,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  RenderTemplateRequest,
} from '@/types/business/features/messaging';

interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface UseMessageTemplatesOptions {
  category?: string;
  autoFetch?: boolean;
}

interface UseMessageTemplatesReturn {
  templates: MessageTemplate[];
  isLoading: boolean;
  error: Error | null;
  fetchTemplates: () => Promise<void>;
  getTemplateByCode: (code: string) => MessageTemplate | undefined;
  getTemplateByContext: (
    contextType: ContextType
  ) => MessageTemplate | undefined;
  createTemplate: (request: CreateTemplateRequest) => Promise<MessageTemplate>;
  updateTemplate: (
    id: string,
    request: UpdateTemplateRequest
  ) => Promise<MessageTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  renderTemplate: (
    code: string,
    variables: Record<string, unknown>
  ) => Promise<string>;
  searchTemplates: (keyword: string) => Promise<MessageTemplate[]>;
}

const CONTEXT_TEMPLATE_MAP: Record<ContextType, string> = {
  ORDER: 'ORDER_REQUIREMENTS',
  PROPOSAL: 'PROPOSAL_ACCEPT',
  JOB: 'JOB_INQUIRY',
  PACKAGE: 'PACKAGE_INQUIRY',
};

/**
 * Hook for managing message templates.
 * Provides CRUD operations and template rendering functionality.
 *
 * @param options - Hook options
 * @returns Template management functions and state
 *
 * @example
 * ```tsx
 * const { templates, getTemplateByContext, renderTemplate } = useMessageTemplates({
 *   category: 'ORDER',
 *   autoFetch: true
 * });
 *
 * // Get template for order context
 * const orderTemplate = getTemplateByContext('ORDER');
 *
 * // Render template with variables
 * const message = await renderTemplate('ORDER_REQUIREMENTS', {
 *   buyer_name: 'Ali',
 *   order_title: 'Logo Tasarımı',
 *   deadline: '5 gün'
 * });
 * ```
 */
export function useMessageTemplates(
  options: UseMessageTemplatesOptions = {}
): UseMessageTemplatesReturn {
  const { category, autoFetch = true } = options;

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch available templates (system + own custom).
   */
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = '/api/v1/message-templates';
      const params: Record<string, string> = { size: '100' };

      if (category) {
        url = `/api/v1/message-templates/category/${category}`;
      }

      const response = await apiClient.get<PageResponse<MessageTemplate>>(
        url,
        params
      );

      setTemplates(response.items);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch templates');
      setError(error);
      logger.error('Failed to fetch templates:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  /**
   * Get a template by its code.
   */
  const getTemplateByCode = useCallback(
    (code: string): MessageTemplate | undefined => {
      return templates.find((t) => t.code === code);
    },
    [templates]
  );

  /**
   * Get the default template for a specific context type.
   */
  const getTemplateByContext = useCallback(
    (contextType: ContextType): MessageTemplate | undefined => {
      const templateCode = CONTEXT_TEMPLATE_MAP[contextType];
      return getTemplateByCode(templateCode);
    },
    [getTemplateByCode]
  );

  /**
   * Create a new custom template.
   */
  const createTemplate = useCallback(
    async (request: CreateTemplateRequest): Promise<MessageTemplate> => {
      setIsLoading(true);
      setError(null);

      try {
        const newTemplate = await apiClient.post<MessageTemplate>(
          '/api/v1/message-templates',
          request
        );

        setTemplates((prev) => [newTemplate, ...prev]);

        return newTemplate;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create template');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update an existing custom template.
   */
  const updateTemplate = useCallback(
    async (
      id: string,
      request: UpdateTemplateRequest
    ): Promise<MessageTemplate> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedTemplate = await apiClient.put<MessageTemplate>(
          `/api/v1/message-templates/${id}`,
          request
        );

        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? updatedTemplate : t))
        );

        return updatedTemplate;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to update template');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a custom template.
   */
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/api/v1/message-templates/${id}`);

      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete template');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Render a template with variable substitution.
   */
  const renderTemplate = useCallback(
    async (
      code: string,
      variables: Record<string, unknown>
    ): Promise<string> => {
      setError(null);

      try {
        const request: RenderTemplateRequest = {
          templateCode: code,
          variables,
        };

        const renderedText = await apiClient.post<string>(
          '/api/v1/message-templates/render',
          request
        );

        return renderedText;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to render template');
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Search templates by keyword.
   */
  const searchTemplates = useCallback(
    async (keyword: string): Promise<MessageTemplate[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string> = {
          keyword,
          size: '50',
        };

        const response = await apiClient.get<PageResponse<MessageTemplate>>(
          '/api/v1/message-templates/search',
          params
        );

        return response.items;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to search templates');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [autoFetch, fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    getTemplateByCode,
    getTemplateByContext,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
    searchTemplates,
  };
}
