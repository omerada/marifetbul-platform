'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Archive, ArchiveRestore, Trash2 } from 'lucide-react';

interface ConversationContextMenuProps {
  conversationId: string;
  isArchived?: boolean;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}

export function ConversationContextMenu({
  conversationId,
  isArchived = false,
  onArchive,
  onUnarchive,
  onDelete,
}: ConversationContextMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(conversationId);
    setOpen(false);
  };

  const handleUnarchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnarchive?.(conversationId);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(conversationId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-full p-1.5 transition-colors hover:bg-gray-200"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
          {isArchived ? (
            <button
              onClick={handleUnarchive}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg hover:bg-gray-50"
            >
              <ArchiveRestore className="h-4 w-4 text-gray-600" />
              <span>Arşivden Çıkar</span>
            </button>
          ) : (
            <button
              onClick={handleArchive}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg hover:bg-gray-50"
            >
              <Archive className="h-4 w-4 text-gray-600" />
              <span>Arşivle</span>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors last:rounded-b-lg hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Sil</span>
          </button>
        </div>
      )}
    </div>
  );
}
