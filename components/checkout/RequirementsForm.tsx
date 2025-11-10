'use client';

/**
 * ================================================
 * REQUIREMENTS FORM COMPONENT
 * ================================================
 * Form for collecting order requirements and notes
 *
 * Features:
 * - Requirements input
 * - Optional notes
 * - Milestone-based project toggle (Sprint 1.1)
 * - Inline milestone creation
 * - Character counter
 * - Form validation
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1: Milestone Integration
 */

'use client';

import React, { useState } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import type { CreateOrderMilestoneRequest } from '@/types/business/features/milestone';

interface PackageData {
  id: string;
  title: string;
  price: number;
  description?: string;
  requirements?: string[];
}

interface RequirementsFormProps {
  packageData: PackageData;
  onSubmit: (
    requirements: string,
    notes?: string,
    milestones?: CreateOrderMilestoneRequest[]
  ) => Promise<void>;
  isLoading: boolean;
}

// Simple milestone form data for inline creation
interface SimpleMilestone {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export function RequirementsForm({
  packageData,
  onSubmit,
  isLoading,
}: RequirementsFormProps) {
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    requirements?: string;
    milestones?: string;
  }>({});

  // Sprint 1.1: Milestone-based project
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<SimpleMilestone[]>([
    { id: '1', title: '', amount: 0, description: '' },
  ]);

  const maxRequirementsLength = 2000;
  const maxNotesLength = 500;

  // Add milestone
  const handleAddMilestone = () => {
    const newId = (milestones.length + 1).toString();
    setMilestones([
      ...milestones,
      { id: newId, title: '', amount: 0, description: '' },
    ]);
  };

  // Remove milestone
  const handleRemoveMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
    }
  };

  // Update milestone
  const handleUpdateMilestone = (
    id: string,
    field: keyof SimpleMilestone,
    value: string | number
  ) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Calculate milestone total
  const milestoneTotal = milestones.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0
  );
  const remainingAmount = packageData.price - milestoneTotal;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { requirements?: string; milestones?: string } = {};

    if (!requirements.trim()) {
      newErrors.requirements = 'Proje gereksinimlerini belirtmelisiniz';
    }

    if (requirements.length > maxRequirementsLength) {
      newErrors.requirements = `Gereksinimler en fazla ${maxRequirementsLength} karakter olabilir`;
    }

    // Validate milestones if enabled
    if (useMilestones) {
      const invalidMilestone = milestones.find(
        (m) => !m.title.trim() || m.amount <= 0
      );
      if (invalidMilestone) {
        newErrors.milestones =
          "Tüm milestone'lar için başlık ve tutar girilmelidir";
      }

      if (Math.abs(remainingAmount) > 0.01) {
        newErrors.milestones = `Milestone toplamı paket fiyatına eşit olmalıdır (${remainingAmount.toFixed(2)} TL fark var)`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare milestones data
    const milestonesData = useMilestones
      ? milestones.map((m, index) => ({
          sequence: index + 1,
          title: m.title.trim(),
          description: m.description.trim() || `Aşama ${index + 1}`,
          amount: Number(m.amount),
        }))
      : undefined;

    // Submit
    setErrors({});
    await onSubmit(
      requirements.trim(),
      notes.trim() || undefined,
      milestonesData
    );
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Proje Gereksinimleri
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Projenizi başlatmak için gerekli bilgileri sağlayın
      </p>

      <form onSubmit={handleSubmit}>
        {/* Package Requirements Info */}
        {packageData.requirements && packageData.requirements.length > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">
              Satıcı İstekleri
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              {packageData.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements Input */}
        <div className="mb-6">
          <label
            htmlFor="requirements"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Proje Detayları
            <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Projeniz hakkında detaylı bilgi verin. Ne yapmak istiyorsunuz? Özel istekleriniz var mı?"
            rows={8}
            maxLength={maxRequirementsLength}
            className={`w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              errors.requirements ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          <div className="mt-2 flex justify-between">
            <div>
              {errors.requirements && (
                <p className="text-sm text-red-600">{errors.requirements}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {requirements.length}/{maxRequirementsLength}
            </p>
          </div>
        </div>

        {/* Sprint 1.1: Milestone Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <PackageIcon className="mt-0.5 h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-900">Aşamalı Proje</h4>
                <p className="text-sm text-purple-700">
                  Projeyi aşamalara bölerek her aşama için ayrı ödeme yapın
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseMilestones(!useMilestones)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none ${
                useMilestones ? 'bg-purple-600' : 'bg-gray-200'
              }`}
              disabled={isLoading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useMilestones ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Milestone Creation Section */}
        {useMilestones && (
          <div className="mb-6 space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-purple-900">Proje Aşamaları</h3>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Aşama Ekle
              </button>
            </div>

            {/* Milestones List */}
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="rounded-lg border border-purple-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Aşama {index + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Aşama Başlığı *
                      </label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            milestone.id,
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="Örn: Tasarım, Geliştirme, Test"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Tutar (TL) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={milestone.amount || ''}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            milestone.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Açıklama
                      </label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            milestone.id,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Bu aşamada neler yapılacak?"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone Summary */}
            <div className="rounded-lg bg-white p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Aşama:</span>
                  <span className="font-medium">{milestones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Milestone Toplamı:</span>
                  <span className="font-medium">
                    {milestoneTotal.toFixed(2)} TL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paket Fiyatı:</span>
                  <span className="font-medium">
                    {packageData.price.toFixed(2)} TL
                  </span>
                </div>
                <div
                  className={`flex justify-between border-t pt-2 font-semibold ${
                    Math.abs(remainingAmount) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  <span>Kalan:</span>
                  <span>{remainingAmount.toFixed(2)} TL</span>
                </div>
              </div>

              {errors.milestones && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-600">{errors.milestones}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div className="mb-6">
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Ek Notlar
            <span className="ml-2 text-xs text-gray-500">(İsteğe Bağlı)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Satıcıya iletmek istediğiniz ek bilgiler..."
            rows={4}
            maxLength={maxNotesLength}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <div className="mt-2 flex justify-end">
            <p className="text-sm text-gray-500">
              {notes.length}/{maxNotesLength}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
            <svg
              className="mr-2 h-5 w-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Önemli Bilgiler
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Ödeme sonrası satıcı siparişinizi inceleyecek ve başlatacak
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Ödemeniz güvende tutulur, teslimat onayından sonra satıcıya
                aktarılır
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Teslimat süresi boyunca satıcıyla mesajlaşabilirsiniz</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !requirements.trim()}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sipariş Oluşturuluyor...
            </span>
          ) : (
            'Ödemeye Geç'
          )}
        </button>
      </form>
    </div>
  );
}

export default RequirementsForm;
