'use client';

import React, { useState } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNotifications } from '@/hooks/business/useNotifications';

export default function NotificationsBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((s) => !s);

  return (
    <div className="relative">
      <Button onClick={toggle} variant="ghost" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h4 className="text-sm font-medium">Bildirimler</h4>
            <div className="flex items-center gap-2">
              <button
                className="text-muted-foreground text-xs"
                onClick={() => {
                  markAllAsRead();
                }}
              >
                Tümünü Okundu Yap
              </button>
              <button className="p-1" onClick={() => setOpen(false)}>
                <X className="text-muted-foreground h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="text-muted-foreground p-4 text-center text-sm">
                Yeni bildirim yok
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b px-3 py-2 hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {n.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(n.createdAt).toLocaleString('tr-TR')}</span>
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <button
                          className="text-xs text-blue-600"
                          onClick={() => markAsRead(n.id)}
                        >
                          Oku
                        </button>
                      )}
                      {n.actionUrl && (
                        <a
                          href={n.actionUrl}
                          className="flex items-center gap-1 text-xs text-blue-600"
                        >
                          Git <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
