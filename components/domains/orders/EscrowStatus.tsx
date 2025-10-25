/**
 * ================================================
 * ESCROW STATUS COMPONENT
 * ================================================
 * Display escrow (emanet) payment status
 *
 * Features:
 * - Escrow status badge
 * - Amount held in escrow
 * - Release information
 * - Security indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';

interface EscrowDetails {
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  amount: number;
  currency: string;
  heldAt: string;
  releasedAt?: string;
  releaseCondition: string;
}

interface EscrowStatusProps {
  escrow: EscrowDetails;
  className?: string;
}

export function EscrowStatus({ escrow, className = '' }: EscrowStatusProps) {
  // Get status config
  const getStatusConfig = () => {
    switch (escrow.status) {
      case 'HELD':
        return {
          label: 'Emanette',
          color: 'yellow',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: 'Ödemeniz güvende tutuluyor',
        };
      case 'RELEASED':
        return {
          label: 'Serbest Bırakıldı',
          color: 'green',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: 'Ödeme satıcıya aktarıldı',
        };
      case 'REFUNDED':
        return {
          label: 'İade Edildi',
          color: 'blue',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: 'Ödeme tarafınıza iade edildi',
        };
      default:
        return {
          label: 'Bilinmeyen',
          color: 'gray',
          icon: null,
          description: '',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emanet Durumu</h3>
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Amount */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-1 text-sm text-gray-600">Tutulan Miktar</div>
        <div className="text-2xl font-bold text-gray-900">
          {escrow.currency === 'TRY' ? '₺' : escrow.currency}
          {escrow.amount.toFixed(2)}
        </div>
      </div>

      {/* Status Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{statusConfig.description}</p>
      </div>

      {/* Timeline */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Emanete Alındı</span>
          <span className="font-medium text-gray-900">
            {new Date(escrow.heldAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {escrow.releasedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {escrow.status === 'RELEASED'
                ? 'Serbest Bırakıldı'
                : 'İade Edildi'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(escrow.releasedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Release Condition */}
      {escrow.status === 'HELD' && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="mb-1 text-sm font-semibold text-blue-900">
                Serbest Bırakma Koşulu
              </div>
              <div className="text-sm text-blue-800">
                {escrow.releaseCondition}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg
            className="h-4 w-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Ödemeniz MarifetBul emanet sistemi ile korunmaktadır</span>
        </div>
      </div>
    </div>
  );
}

export default EscrowStatus;
