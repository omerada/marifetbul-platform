/**
 * ================================================
 * USER REPORTS PAGE
 * ================================================
 * User report moderation interface
 *
 * Sprint 2.4: User Reports System
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
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

interface MockReport {
  id: string;
  reporterName: string;
  reportedUserName: string;
  reportedUserAvatar?: string;
  reason: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  createdAt: string;
  evidence?: string[];
}

export default function ModeratorReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);

  // Mock data
  const reports: MockReport[] = [
    {
      id: '1',
      reporterName: 'Ahmet Yılmaz',
      reportedUserName: 'spam_user_123',
      reason: 'SPAM',
      description:
        'Bu kullanıcı sürekli spam mesajlar gönderiyor ve istenmeyen içerikler paylaşıyor.',
      priority: 'HIGH',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      evidence: ['https://example.com/screenshot1.png'],
    },
    {
      id: '2',
      reporterName: 'Zeynep Demir',
      reportedUserName: 'fake_account',
      reason: 'FAKE_PROFILE',
      description:
        'Sahte profil kullanıyor, başka birinin fotoğraflarını paylaşıyor.',
      priority: 'MEDIUM',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      reporterName: 'Mehmet Kaya',
      reportedUserName: 'abusive_user',
      reason: 'ABUSIVE_BEHAVIOR',
      description: 'Hakaret içeren mesajlar gönderiyor ve tehdit ediyor.',
      priority: 'URGENT',
      status: 'IN_REVIEW',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

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

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const handleWarn = (reportId: string) => {
    console.log('Warn user for report:', reportId);
    // TODO: API call
  };

  const handleSuspend = (reportId: string) => {
    console.log('Suspend user for report:', reportId);
    // TODO: API call
  };

  const handleBan = (reportId: string) => {
    console.log('Ban user for report:', reportId);
    // TODO: API call
  };

  const handleDismiss = (reportId: string) => {
    console.log('Dismiss report:', reportId);
    // TODO: API call
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
                {reports.filter((r) => r.status === 'IN_REVIEW').length}
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
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                          report.priority
                        )}`}
                      >
                        {report.priority}
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
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                      selectedReport.priority
                    )}`}
                  >
                    {selectedReport.priority} Priority
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
        <p className="text-sm text-gray-600">Toplam {reports.length} rapor</p>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Önceki
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
