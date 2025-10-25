/**
 * ================================================
 * REQUIREMENTS FORM COMPONENT
 * ================================================
 * Form for collecting order requirements and notes
 *
 * Features:
 * - Requirements input
 * - Optional notes
 * - Character counter
 * - Form validation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';

interface Package {
  id: string;
  title: string;
  description?: string;
  requirements?: string[];
}

interface RequirementsFormProps {
  packageData: Package;
  onSubmit: (requirements: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export function RequirementsForm({
  packageData,
  onSubmit,
  isLoading,
}: RequirementsFormProps) {
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ requirements?: string }>({});

  const maxRequirementsLength = 2000;
  const maxNotesLength = 500;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { requirements?: string } = {};

    if (!requirements.trim()) {
      newErrors.requirements = 'Proje gereksinimlerini belirtmelisiniz';
    }

    if (requirements.length > maxRequirementsLength) {
      newErrors.requirements = `Gereksinimler en fazla ${maxRequirementsLength} karakter olabilir`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    setErrors({});
    await onSubmit(requirements.trim(), notes.trim() || undefined);
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
