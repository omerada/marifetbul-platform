/**
 * ================================================
 * MODERATOR TICKETS PAGE
 * ================================================
 * Dedicated moderator ticket management interface
 * No duplicate admin components - clean separation of concerns
 *
 * Sprint 1 - Story 1.2: Ticket Management System
 * @author MarifetBul Development Team
 * @version 2.0.0 - Dedicated Moderator Components
 * @created November 3, 2025
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { ModeratorTicketQueue } from '@/components/domains/moderator/ModeratorTicketQueue';

/**
 * Moderator Tickets Page
 *
 * Clean, dedicated moderator interface:
 * - Uses specialized ModeratorTicketQueue component
 * - No admin component dependencies
 * - Focused on ticket/support workflows
 * - Assign, resolve, close operations
 * - Bulk moderation support
 */
export default function ModeratorTicketsPage() {
  const searchParams = useSearchParams();

  // Get initial status from URL (default: open)
  const initialStatus =
    (searchParams?.get('status') as 'open' | 'pending' | 'in_progress') ||
    'open';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
          <p className="mt-2 text-gray-600">
            Kullanıcı destek taleplerini yönetin ve çözün
          </p>
        </div>

        {/* Main Content */}
        <ModeratorTicketQueue initialStatus={initialStatus} />
      </div>
    </div>
  );
}
