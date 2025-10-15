/**
 * SidebarBottomSection Component
 *
 * Bottom section with alerts and logout
 */

import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import type { SidebarBottomSectionProps } from '../types/sidebarTypes';

export function SidebarBottomSection({
  alertCount,
  onLogout,
  isCollapsed,
}: SidebarBottomSectionProps) {
  if (isCollapsed) {
    return (
      <div className="space-y-2 border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-full"
          title="Bildirimler"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-full"
          onClick={onLogout}
          title="Çıkış Yap"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t p-4">
      <Button variant="outline" className="w-full justify-start">
        <Bell className="mr-3 h-5 w-5" />
        <span className="flex-1 text-left">Bildirimler</span>
        {alertCount > 0 && <Badge variant="destructive">{alertCount}</Badge>}
      </Button>

      <Button
        variant="ghost"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
        onClick={onLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Çıkış Yap</span>
      </Button>
    </div>
  );
}
