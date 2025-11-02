/**
 * ================================================
 * WALLET PAGE
 * ================================================
 * Main wallet dashboard page
 *
 * Features:
 * - Balance overview
 * - Recent transactions
 * - Quick actions
 * - Escrow tracking
 *
 * Sprint 1 - Epic 1.1 - Day 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { WalletDashboard } from '@/components/domains/wallet';

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <WalletDashboard defaultView="overview" showAnalytics={true} />
    </div>
  );
}
