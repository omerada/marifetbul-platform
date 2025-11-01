'use client';

import { useState, useMemo } from 'react';
import { X, Send, MessageSquare, Sparkles } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useMessageTemplates } from '@/hooks/business/messaging/useMessageTemplates';
import { useContextMessage } from '@/hooks/business/messaging/useContextMessage';
import { logger } from '@/lib/shared/utils/logger';
import type { MessageContext } from '@/types/business/features/messaging';
import { MESSAGE_TEMPLATE_CATEGORIES } from '@/types/business/features/messaging';

export interface QuickMessageModalProps {
  /**
   * Modal visibility state
   */
  isOpen: boolean;

  /**
   * Close modal callback
   */
  onClose: () => void;

  /**
   * Recipient user ID
   */
  recipientId: string;

  /**
   * Recipient display name
   */
  recipientName: string;

  /**
   * Optional context (Order, Proposal, Job, Package)
   */
  context?: MessageContext;

  /**
   * Callback after message sent successfully
   */
  onMessageSent?: (conversationId: string) => void;
}

/**
 * Modal for sending context-aware messages with template selection.
 * Provides quick access to message templates and custom message composition.
 *
 * @example
 * ```tsx
 * <QuickMessageModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   recipientId={freelancerId}
 *   recipientName="Ahmet Yılmaz"
 *   context={{
 *     type: 'ORDER',
 *     id: orderId,
 *     title: 'Web Sitesi Geliştirme',
 *   }}
 *   onMessageSent={(conversationId) => router.push(`/messages/${conversationId}`)}
 * />
 * ```
 */
export function QuickMessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  context,
  onMessageSent,
}: QuickMessageModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { templates, renderTemplate } = useMessageTemplates({
    category: context?.type,
    autoFetch: isOpen,
  });

  const { sendContextMessage, isLoading, error } = useContextMessage();

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return templates;
    return templates.filter((t) => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  // Get template categories that have templates
  const availableCategories = useMemo(() => {
    const categoriesInUse = new Set(templates.map((t) => t.category));
    return MESSAGE_TEMPLATE_CATEGORIES.filter((cat) =>
      categoriesInUse.has(cat.code)
    );
  }, [templates]);

  // Handle template selection
  const handleTemplateSelect = async (templateCode: string) => {
    setSelectedTemplateId(templateCode);

    const template = templates.find((t) => t.code === templateCode);
    if (template && context) {
      try {
        const rendered = await renderTemplate(template.code, {
          recipientName,
          contextTitle: context.title,
          contextId: context.id,
          ...context.additionalData,
        });
        setMessageContent(rendered);
      } catch (err) {
        logger.error('Failed to render template:', err);
      }
    }
  };

  // Handle message send
  const handleSend = async () => {
    if (!messageContent.trim()) return;

    try {
      const result = await sendContextMessage({
        recipientId,
        content: messageContent,
        context,
        templateCode: selectedTemplateId || undefined,
      });

      if (result) {
        // Reset form
        setMessageContent('');
        setSelectedTemplateId('');
        setSelectedCategory('');

        // Notify parent
        onMessageSent?.(result.conversationId);
      }
    } catch (err) {
      // Error is handled by useContextMessage hook
      logger.error('Failed to send message:', err);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setMessageContent('');
      setSelectedTemplateId('');
      setSelectedCategory('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-900">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary-600 h-6 w-6" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mesaj Gönder
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recipientName}
                  {context && (
                    <span className="text-primary-600 ml-2">
                      • {context.title}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </UnifiedButton>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Context Info */}
            {context && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 dark:bg-primary-800 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <MessageSquare className="text-primary-600 dark:text-primary-400 h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {context.type === 'ORDER' && 'Sipariş'}
                      {context.type === 'PROPOSAL' && 'Teklif'}
                      {context.type === 'JOB' && 'İş İlanı'}
                      {context.type === 'PACKAGE' && 'Paket'}
                    </p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                      {context.title}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Hızlı Şablonlar
                  </h3>
                </div>

                {/* Category Filter */}
                {availableCategories.length > 1 && (
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </Select>
                )}

                {/* Template List */}
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template.code)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selectedTemplateId === template.code
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:border-primary-300 dark:hover:border-primary-700 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {template.code}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {template.templateText.slice(0, 60)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <label
                htmlFor="message-content"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Mesajınız
              </label>
              <Textarea
                id="message-content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Mesajınızı yazın..."
                rows={6}
                className="w-full"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {messageContent.length} / 2000 karakter
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <UnifiedButton
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              onClick={handleSend}
              loading={isLoading}
              disabled={!messageContent.trim() || isLoading}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Gönder
            </UnifiedButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
