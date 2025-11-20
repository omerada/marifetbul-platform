'use client';

/**
 * ================================================
 * COMMISSION RULE FORM MODAL
 * ================================================
 * Modal form for creating/editing commission rules
 *
 * Features:
 * - Create new rules
 * - Edit existing rules
 * - Form validation
 * - Rule type selection
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { useState, useEffect } from 'react';
import type {
  CommissionRule,
  CommissionRuleRequest,
} from '@/lib/api/commission';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { X } from 'lucide-react';

// ================================================
// TYPES
// ================================================

interface CommissionRuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommissionRuleRequest) => Promise<void>;
  rule?: CommissionRule | null;
}

// ================================================
// MAIN COMPONENT
// ================================================

export const CommissionRuleFormModal: React.FC<
  CommissionRuleFormModalProps
> = ({ isOpen, onClose, onSubmit, rule }) => {
  const [formData, setFormData] = useState<CommissionRuleRequest>({
    ruleType: 'GLOBAL',
    rate: 0.05,
    validFrom: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (rule) {
      setFormData({
        ruleType: rule.ruleType,
        rate: rule.rate,
        validFrom: rule.validFrom.split('T')[0],
        validTo: rule.validTo?.split('T')[0],
        isActive: rule.isActive,
        description: rule.description,
        categoryId: rule.categoryId,
        userId: rule.userId,
      });
    } else {
      setFormData({
        ruleType: 'GLOBAL',
        rate: 0.05,
        validFrom: new Date().toISOString().split('T')[0],
        isActive: true,
      });
    }
  }, [rule]);

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'rate') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) / 100 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <Card className="m-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {rule ? 'Komisyon Kuralı Düzenle' : 'Yeni Komisyon Kuralı'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rule Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kural Tipi *
              </label>
              <select
                name="ruleType"
                value={formData.ruleType}
                onChange={handleChange}
                required
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
              >
                <option value="GLOBAL">Global (Tüm platform)</option>
                <option value="CATEGORY">Kategori bazlı</option>
                <option value="USER">Kullanıcı bazlı</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Global: Tüm işlemlere uygulanır. Kategori: Belirli kategorilere
                uygulanır. Kullanıcı: Belirli kullanıcılara uygulanır.
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Komisyon Oranı (%) *
              </label>
              <input
                type="number"
                name="rate"
                value={(formData.rate * 100).toFixed(2)}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                required
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                placeholder="5.00"
              />
              <p className="mt-1 text-xs text-gray-500">
                Platform komisyon oranı (örn: 5 = %5)
              </p>
            </div>

            {/* Valid From */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                required
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
              />
            </div>

            {/* Valid To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bitiş Tarihi (Opsiyonel)
              </label>
              <input
                type="date"
                name="validTo"
                value={formData.validTo || ''}
                onChange={handleChange}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Boş bırakılırsa süresiz geçerli olur
              </p>
            </div>

            {/* Category ID (if CATEGORY type) */}
            {formData.ruleType === 'CATEGORY' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kategori ID *
                </label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  required
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                  placeholder="Kategori UUID'si"
                />
              </div>
            )}

            {/* User ID (if USER type) */}
            {formData.ruleType === 'USER' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kullanıcı ID *
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId || ''}
                  onChange={handleChange}
                  required
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                  placeholder="Kullanıcı UUID'si"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                placeholder="Bu kuralın amacını açıklayın..."
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Kuralı aktif olarak oluştur
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                İptal
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                {rule ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CommissionRuleFormModal;
