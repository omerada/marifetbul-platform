/**
 * SystemHealthCard Component
 *
 * System health widget wrapper
 */

import SystemHealthWidget from '../../SystemHealthWidget';
import type { SystemHealthCardProps } from '../types/adminDashboardTypes';

export function SystemHealthCard({ systemHealth }: SystemHealthCardProps) {
  if (!systemHealth) return null;

  return (
    <div className="rounded-lg border bg-white shadow-lg">
      <SystemHealthWidget />
    </div>
  );
}
