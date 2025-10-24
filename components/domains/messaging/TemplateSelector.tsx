'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMessageTemplates } from '@/hooks/business/messaging/useMessageTemplates';
import { FileText, Search } from 'lucide-react';
import type { MessageTemplate } from '@/types/business/features/messaging';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MessageTemplate) => void;
  position?: { top: number; left: number };
}

/**
 * Template selector dropdown component.
 * Displays list of message templates for quick insertion into message composer.
 */
export function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  position,
}: TemplateSelectorProps) {
  const { templates, isLoading } = useMessageTemplates({ autoFetch: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = templates.filter(
    (template) =>
      searchQuery === '' ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.templateText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredTemplates.length - 1)
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredTemplates[selectedIndex]) {
            onSelectTemplate(filteredTemplates[selectedIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filteredTemplates, selectedIndex, onClose, onSelectTemplate]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-xl"
      style={
        position
          ? { top: position.top, left: position.left }
          : { bottom: '100%', left: 0, marginBottom: '0.5rem' }
      }
    >
      {/* Search Header */}
      <div className="border-b border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Yükleniyor...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {searchQuery ? 'Şablon bulunamadı' : 'Henüz şablon yok'}
            </p>
          </div>
        ) : (
          <ul className="py-2">
            {filteredTemplates.map((template, index) => (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        index === selectedIndex
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {template.description || template.code}
                        </span>
                        {template.isSystem && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            Sistem
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {template.templateText}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer Help Text */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <p className="text-xs text-gray-500">
          <kbd className="rounded bg-white px-1.5 py-0.5 text-gray-700 shadow-sm">
            ↑↓
          </kbd>{' '}
          hareket,{' '}
          <kbd className="rounded bg-white px-1.5 py-0.5 text-gray-700 shadow-sm">
            Enter
          </kbd>{' '}
          seç,{' '}
          <kbd className="rounded bg-white px-1.5 py-0.5 text-gray-700 shadow-sm">
            Esc
          </kbd>{' '}
          kapat
        </p>
      </div>
    </div>
  );
}
