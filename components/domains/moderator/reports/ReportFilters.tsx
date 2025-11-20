'use client';

/**
 * ================================================
 * REPORT FILTERS COMPONENT
 * ================================================
 * Filter panel for report moderation queue
 *
 * Sprint 1 - Story 3, Task 3.4
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Filter } from 'lucide-react';

export interface ReportFiltersProps {
  onFilterChange: () => void;
}

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  const [status, setStatus] = useState('all');

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Filter className="text-muted-foreground h-5 w-5" />
        <div className="flex flex-1 gap-4">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              onFilterChange();
            }}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="all">Tüm Raporlar</option>
            <option value="pending">Bekleyen</option>
            <option value="investigating">İnceleniyor</option>
            <option value="resolved">Çözümlendi</option>
          </select>
          {/* TODO: Add more filters - priority, type, date range */}
        </div>
      </div>
    </Card>
  );
}
