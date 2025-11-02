/**
 * ================================================
 * USER REPORTS PAGE
 * ================================================
 * User report moderation interface
 *
 * Sprint 2: Mock Data Removed - Real API Integration
 * @version 3.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import {
  getPendingReports,
  resolveReport,
  dismissReport,
} from '@/lib/api/moderation';
import type { ReportDto } from '@/types/business/moderation';
import {
  AlertTriangle,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Eye,
} from 'lucide-react';

type ReportStatus = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

export default function ModeratorReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await getPendingReports(currentPage, 20);
        setReports(response.reports);
        setTotalReports(response.total);
        logger.info('Fetched reports:', response.reports.length);
      } catch (error) {
        logger.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [selectedStatus, currentPage]);

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      SPAM: 'Spam',
      SCAM: 'Dolandırıcılık',
      ABUSIVE_BEHAVIOR: 'Taciz/Hakaret',
      HARASSMENT: 'Taciz',
      FAKE_PROFILE: 'Sahte Profil',
      COPYRIGHT_VIOLATION: 'Telif Hakkı İhlali',
      INAPPROPRIATE_CONTENT: 'Uygunsuz İçerik',
      OTHER: 'Diğer',
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      INVESTIGATING: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      PENDING: 'Bekleyen',
      INVESTIGATING: 'İncelemede',
      RESOLVED: 'Çözümlendi',
      REJECTED: 'Reddedildi',
    };
    return labels[status] || status;
  };

  const handleWarn = async (reportId: string) => {
    try {
      logger.debug('Warn user for report:', reportId);
      await resolveReport(reportId, 'WARN', 'User warned by moderator');
      // Refetch reports
      const response = await getPendingReports(currentPage, 20);
      setReports(response.reports);
      setTotalReports(response.total);
    } catch (error) {
      logger.error('Failed to warn user:', error);
    }
  };

  const handleSuspend = async (reportId: string) => {
    try {
      logger.debug('Suspend user for report:', reportId);
      await resolveReport(reportId, 'SUSPEND', 'User suspended by moderator');
      // Refetch reports
      const response = await getPendingReports(currentPage, 20);
      setReports(response.reports);
      setTotalReports(response.total);
    } catch (error) {
      logger.error('Failed to suspend user:', error);
    }
  };

  const handleBan = async (reportId: string) => {
    try {
      logger.debug('Ban user for report:', reportId);
      await resolveReport(reportId, 'BAN', 'User banned by moderator');
      // Refetch reports
      const response = await getPendingReports(currentPage, 20);
      setReports(response.reports);
      setTotalReports(response.total);
    } catch (error) {
      logger.error('Failed to ban user:', error);
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      logger.debug('Dismiss report:', reportId);
      await dismissReport(reportId, 'Report dismissed - no violation found');
      // Refetch reports
      const response = await getPendingReports(currentPage, 20);
      setReports(response.reports);
      setTotalReports(response.total);
    } catch (error) {
      logger.error('Failed to dismiss report:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Kullanıcı Şikayetleri
        </h1>
        <p className="mt-2 text-gray-600">
          Kullanıcı raporlarını inceleyin ve gerekli işlemleri yapın
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === 'PENDING').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">İncelemede</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter((r) => r.status === 'INVESTIGATING').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Çözümlenen</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reddedilen</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(
            ['ALL', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' && 'Tümü'}
              {status === 'PENDING' && 'Bekleyen'}
              {status === 'IN_REVIEW' && 'İncelemede'}
              {status === 'RESOLVED' && 'Çözümlenen'}
              {status === 'DISMISSED' && 'Reddedilen'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rapor ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">Raporlar yükleniyor...</p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">Henüz rapor bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                {/* Report Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {report.reportedUserName}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Raporlayan: {report.reporterName}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                      {getReasonLabel(report.reason)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-3 text-gray-900">{report.description}</p>

                  {/* Evidence */}
                  {report.evidence && report.evidence.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Kanıtlar:
                      </p>
                      <div className="flex gap-2">
                        {report.evidence.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Kanıt {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Detay
                </button>
                <button
                  onClick={() => handleWarn(report.id)}
                  className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Uyar
                </button>
                <button
                  onClick={() => handleSuspend(report.id)}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
                >
                  <Shield className="h-4 w-4" />
                  Askıya Al
                </button>
                <button
                  onClick={() => handleBan(report.id)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  <Ban className="h-4 w-4" />
                  Engelle
                </button>
                <button
                  onClick={() => handleDismiss(report.id)}
                  className="ml-auto flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Rapor Detayı</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Reported User */}
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="mb-2 text-sm font-medium text-red-900">
                Rapor Edilen Kullanıcı
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-200">
                  <span className="text-lg font-medium text-red-700">
                    {selectedReport.reportedUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedReport.reportedUserName}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                      selectedReport.status
                    )}`}
                  >
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reporter */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Raporlayan
              </p>
              <p className="text-gray-900">{selectedReport.reporterName}</p>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Sebep</p>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                {getReasonLabel(selectedReport.reason)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Açıklama</p>
              <p className="text-gray-900">{selectedReport.description}</p>
            </div>

            {/* Evidence */}
            {selectedReport.evidence && selectedReport.evidence.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Kanıtlar
                </p>
                <div className="space-y-2">
                  {selectedReport.evidence.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-gray-200 p-3 text-blue-600 hover:bg-gray-50"
                    >
                      Kanıt {idx + 1}: {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleWarn(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
              >
                Kullanıcıyı Uyar
              </button>
              <button
                onClick={() => {
                  handleSuspend(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                Askıya Al
              </button>
              <button
                onClick={() => {
                  handleBan(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Kalıcı Engelle
              </button>
              <button
                onClick={() => {
                  handleDismiss(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Raporu Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">Toplam {totalReports} rapor</p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Sayfa {currentPage + 1}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={(currentPage + 1) * 20 >= totalReports}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
