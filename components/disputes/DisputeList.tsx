'use client';

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { DisputeCard } from './DisputeCard';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useDisputeList } from '@/hooks/business/disputes';

interface DisputeListProps {
  showOrder?: boolean;
  showUserInfo?: boolean;
}

export function DisputeList({
  showOrder = false,
  showUserInfo = false,
}: DisputeListProps) {
  const { disputes, isLoading, error } = useDisputeList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'İtirazlar yüklenirken bir hata oluştu'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">İtiraz Bulunamadı</h3>
        <p className="text-muted-foreground">
          Henüz hiç itiraz oluşturulmamış.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dispute Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {disputes.map((dispute) => (
          <DisputeCard
            key={dispute.id}
            dispute={dispute}
            showOrder={showOrder}
            showUserInfo={showUserInfo}
          />
        ))}
      </div>
    </div>
  );
}
