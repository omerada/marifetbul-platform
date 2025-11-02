/**
 * ================================================
 * AUTO-MODERATION RULES PANEL
 * ================================================
 * Admin panel for managing auto-moderation rules
 *
 * Sprint: Sprint 3 - Day 3 (Moderator Dashboard Enhancement)
 * Features: Rule CRUD, keyword blacklist, pattern detection, rule testing
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Label, Textarea } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  TestTube,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type AutoModerationRule,
  type AutoModerationRuleRequest,
  RuleType,
  AutoModerationAction,
  RuleSeverity,
  getAutoModerationRules,
  createAutoModerationRule,
  updateAutoModerationRule,
  deleteAutoModerationRule,
  toggleAutoModerationRule,
  getRuleTypeLabel,
  getActionLabel,
  getSeverityLabel,
  getSeverityColor,
  getActionColor,
  testAutoModerationRule,
} from '@/lib/api/auto-moderation';

// ================================================
// COMPONENT PROPS
// ================================================

export interface AutoModerationRulesPanelProps {
  onRuleChange?: () => void;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function AutoModerationRulesPanel({
  onRuleChange,
}: AutoModerationRulesPanelProps) {
  // ================================================
  // STATE
  // ================================================

  const [rules, setRules] = useState<AutoModerationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoModerationRule | null>(
    null
  );

  // Filter states
  const [filterType, setFilterType] = useState<RuleType | 'ALL'>('ALL');
  const [filterEnabled, setFilterEnabled] = useState<boolean | 'ALL'>('ALL');

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    loadRules();
  }, []);

  // ================================================
  // DATA LOADING
  // ================================================

  const loadRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAutoModerationRules({}, 0, 100);
      setRules(response.data);
    } catch (_err) {
      const message = 'Kurallar yüklenemedi';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HANDLERS
  // ================================================

  const handleToggleRule = async (rule: AutoModerationRule) => {
    try {
      await toggleAutoModerationRule(rule.id, !rule.enabled);
      toast.success(
        rule.enabled ? 'Kural devre dışı bırakıldı' : 'Kural etkinleştirildi'
      );
      await loadRules();
      onRuleChange?.();
    } catch (_err) {
      toast.error('Hata', {
        description: 'Kural durumu değiştirilemedi',
      });
    }
  };

  const handleDeleteRule = async (rule: AutoModerationRule) => {
    if (!confirm(`"${rule.name}" kuralını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteAutoModerationRule(rule.id);
      toast.success('Kural silindi');
      await loadRules();
      onRuleChange?.();
    } catch (_err) {
      toast.error('Hata', {
        description: 'Kural silinemedi',
      });
    }
  };

  const handleEditRule = (rule: AutoModerationRule) => {
    setEditingRule(rule);
    setIsEditDialogOpen(true);
  };

  const handleTestRule = (rule: AutoModerationRule) => {
    setEditingRule(rule);
    setIsTestDialogOpen(true);
  };

  // ================================================
  // FILTERING
  // ================================================

  const filteredRules = rules.filter((rule) => {
    if (filterType !== 'ALL' && rule.type !== filterType) return false;
    if (filterEnabled !== 'ALL' && rule.enabled !== filterEnabled) return false;
    return true;
  });

  const enabledCount = rules.filter((r) => r.enabled).length;
  const disabledCount = rules.filter((r) => !r.enabled).length;

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Otomatik Moderasyon Kuralları</h2>
          <p className="text-gray-600">
            Yorumları otomatik olarak kontrol eden kuralları yönetin
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kural
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Toplam Kural</div>
          <div className="mt-1 text-2xl font-bold">{rules.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Etkin</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {enabledCount}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Devre Dışı</div>
          <div className="mt-1 text-2xl font-bold text-gray-600">
            {disabledCount}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">
            Bugün Tetiklenen
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {rules.reduce((sum, r) => sum + r.triggerCount, 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as RuleType | 'ALL')}
          className="rounded-lg border px-4 py-2"
        >
          <option value="ALL">Tüm Tipler</option>
          {Object.values(RuleType).map((type) => (
            <option key={type} value={type}>
              {getRuleTypeLabel(type)}
            </option>
          ))}
        </select>

        <select
          value={
            filterEnabled === 'ALL' ? 'ALL' : filterEnabled ? 'true' : 'false'
          }
          onChange={(e) =>
            setFilterEnabled(
              e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true'
            )
          }
          className="rounded-lg border px-4 py-2"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="true">Etkin</option>
          <option value="false">Devre Dışı</option>
        </select>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Shield className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Henüz kural eklenmemiş</p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Kuralı Ekle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg border bg-white p-4 transition-all ${
                rule.enabled ? 'border-l-4 border-l-green-500' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(
                        rule.severity
                      )}`}
                    >
                      {getSeverityLabel(rule.severity)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getActionColor(
                        rule.action
                      )}`}
                    >
                      {getActionLabel(rule.action)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {getRuleTypeLabel(rule.type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {rule.description}
                  </p>

                  {/* Rule Details */}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    {rule.keywords && rule.keywords.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Anahtar Kelimeler:
                        </span>{' '}
                        <span className="text-gray-600">
                          {rule.keywords.slice(0, 3).join(', ')}
                          {rule.keywords.length > 3 &&
                            ` +${rule.keywords.length - 3} daha`}
                        </span>
                      </div>
                    )}
                    {rule.triggerCount > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Tetiklenme:
                        </span>{' '}
                        <span className="text-gray-600">
                          {rule.triggerCount} kez
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`rounded-lg p-2 transition-colors ${
                      rule.enabled
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={rule.enabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                  >
                    {rule.enabled ? (
                      <Power className="h-5 w-5" />
                    ) : (
                      <PowerOff className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleTestRule(rule)}
                    className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                    title="Test Et"
                  >
                    <TestTube className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
                    title="Düzenle"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule)}
                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    title="Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <RuleFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          loadRules();
          onRuleChange?.();
        }}
      />

      {editingRule && (
        <>
          <RuleFormDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingRule(null);
            }}
            onSuccess={() => {
              loadRules();
              onRuleChange?.();
            }}
            rule={editingRule}
          />

          <RuleTestDialog
            isOpen={isTestDialogOpen}
            onClose={() => {
              setIsTestDialogOpen(false);
              setEditingRule(null);
            }}
            rule={editingRule}
          />
        </>
      )}
    </div>
  );
}

// ================================================
// RULE FORM DIALOG
// ================================================

interface RuleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rule?: AutoModerationRule;
}

function RuleFormDialog({
  isOpen,
  onClose,
  onSuccess,
  rule,
}: RuleFormDialogProps) {
  const [formData, setFormData] = useState<AutoModerationRuleRequest>({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || RuleType.KEYWORD,
    severity: rule?.severity || RuleSeverity.MEDIUM,
    enabled: rule?.enabled ?? true,
    action: rule?.action || AutoModerationAction.HOLD_FOR_REVIEW,
    keywords: rule?.keywords || [],
    patterns: rule?.patterns || [],
    caseSensitive: rule?.caseSensitive ?? false,
    wholeWordOnly: rule?.wholeWordOnly ?? true,
    notifyModerator: rule?.notifyModerator ?? true,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Kural adı gerekli');
      return;
    }

    if (!formData.description.trim()) {
      setError('Açıklama gerekli');
      return;
    }

    if (formData.type === RuleType.KEYWORD && formData.keywords!.length === 0) {
      setError('En az bir anahtar kelime ekleyin');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (rule) {
        await updateAutoModerationRule(rule.id, formData);
        toast.success('Kural güncellendi');
      } else {
        await createAutoModerationRule(formData);
        toast.success('Kural oluşturuldu');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'İşlem başarısız oldu';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !formData.keywords!.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords!, keyword],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords!.filter((k) => k !== keyword),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}
          </DialogTitle>
          <DialogDescription>
            Otomatik moderasyon kuralı yapılandırın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label>
              Kural Adı <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Örn: Küfür Filtresi"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Açıklama <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[80px]"
              placeholder="Kuralın ne yaptığını açıklayın..."
            />
          </div>

          {/* Rule Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kural Tipi</Label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as RuleType,
                  })
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                {Object.values(RuleType).map((type) => (
                  <option key={type} value={type}>
                    {getRuleTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Önem Derecesi</Label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value as RuleSeverity,
                  })
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                {Object.values(RuleSeverity).map((sev) => (
                  <option key={sev} value={sev}>
                    {getSeverityLabel(sev)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eylem</Label>
            <select
              value={formData.action}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  action: e.target.value as AutoModerationAction,
                })
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {Object.values(AutoModerationAction).map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Keywords */}
          {formData.type === RuleType.KEYWORD && (
            <div className="space-y-2">
              <Label>
                Anahtar Kelimeler <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  className="flex-1 rounded-lg border px-3 py-2"
                  placeholder="Kelime ekleyin ve Enter'a basın..."
                />
                <Button type="button" onClick={handleAddKeyword}>
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords!.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2">
            <Label>Seçenekler</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                />
                <span className="text-sm">Kural etkin</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.caseSensitive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      caseSensitive: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Büyük/küçük harf duyarlı</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.wholeWordOnly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wholeWordOnly: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Sadece tam kelime eşleşmesi</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyModerator}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifyModerator: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Moderatöre bildirim gönder</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : rule ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================================================
// RULE TEST DIALOG
// ================================================

interface RuleTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rule: AutoModerationRule;
}

function RuleTestDialog({ isOpen, onClose, rule }: RuleTestDialogProps) {
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    matchedTerms: string[];
    confidence: number;
    suggestedAction: AutoModerationAction;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!testText.trim()) {
      toast.error('Test metni giriniz');
      return;
    }

    setIsTesting(true);

    try {
      const result = await testAutoModerationRule(
        {
          name: rule.name,
          description: rule.description,
          type: rule.type,
          severity: rule.severity,
          enabled: rule.enabled,
          action: rule.action,
          keywords: rule.keywords,
          patterns: rule.patterns,
          caseSensitive: rule.caseSensitive,
          wholeWordOnly: rule.wholeWordOnly,
          notifyModerator: rule.notifyModerator,
        },
        testText
      );

      setTestResult(result);
    } catch (_err) {
      toast.error('Test başarısız oldu');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kural Testi: {rule.name}</DialogTitle>
          <DialogDescription>
            Kuralın nasıl çalıştığını test edin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Test Metni</Label>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="min-h-[120px]"
              placeholder="Test edilecek metni buraya yazın..."
            />
          </div>

          <Button
            onClick={handleTest}
            disabled={isTesting || !testText.trim()}
            className="w-full"
          >
            <TestTube className="mr-2 h-4 w-4" />
            {isTesting ? 'Test Ediliyor...' : 'Test Et'}
          </Button>

          {testResult && (
            <div
              className={`rounded-lg border p-4 ${
                testResult.matched
                  ? 'border-red-200 bg-red-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                {testResult.matched ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span
                  className={`font-semibold ${
                    testResult.matched ? 'text-red-900' : 'text-green-900'
                  }`}
                >
                  {testResult.matched
                    ? 'Kural Tetiklendi!'
                    : 'Kural Tetiklenmedi'}
                </span>
              </div>

              {testResult.matched && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Eşleşen Terimler:</span>{' '}
                    {testResult.matchedTerms.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Güven Skoru:</span>{' '}
                    {(testResult.confidence * 100).toFixed(0)}%
                  </div>
                  <div>
                    <span className="font-medium">Önerilen Eylem:</span>{' '}
                    <span
                      className={`rounded-full px-2 py-0.5 ${getActionColor(
                        testResult.suggestedAction
                      )}`}
                    >
                      {getActionLabel(testResult.suggestedAction)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
