/**
 * SidebarUserProfile Component
 *
 * Current admin user profile display
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import type { SidebarUserProfileProps } from '../types/sidebarTypes';

export function SidebarUserProfile({
  user,
  isCollapsed,
}: SidebarUserProfileProps) {
  if (!user) return null;

  if (isCollapsed) {
    return (
      <div className="flex justify-center border-b p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {(user.name || 'U').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="border-b p-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {(user.name || 'U').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          <span className="text-primary text-xs font-medium">{user.role}</span>
        </div>
      </div>
    </div>
  );
}
