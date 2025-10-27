'use client';

import React, { useState } from 'react';
import { useMessageTemplates } from '@/hooks/business/messaging/useMessageTemplates';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/shared/utils/logger';
import type {
  MessageTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '@/types/business/features/messaging';

const TEMPLATE_CATEGORIES = [
  { value: 'GREETING', label: 'Selamlama' },
  { value: 'AVAILABILITY', label: 'Müsaitlik' },
  { value: 'PRICING', label: 'Fiyatlandırma' },
  { value: 'DEADLINE', label: 'Termin' },
  { value: 'REVISION_POLICY', label: 'Revizyon' },
  { value: 'DELIVERY', label: 'Teslimat' },
  { value: 'CUSTOM', label: 'Özel' },
];

interface TemplateFormData {
  code: string;
  description: string;
  templateText: string;
  category: string;
}

export default function TemplatesPage() {
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useMessageTemplates({ autoFetch: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    code: '',
    description: '',
    templateText: '',
    category: 'CUSTOM',
  });

  const filteredTemplates = templates.filter((template) => {
    if (template.isSystem) return false;

    const matchesSearch =
      searchQuery === '' ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.templateText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === '' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateClick = () => {
    setFormData({
      code: '',
      description: '',
      templateText: '',
      category: 'CUSTOM',
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      code: template.code,
      description: template.description || '',
      templateText: template.templateText,
      category: template.category,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const request: CreateTemplateRequest = {
        code: formData.code.toUpperCase().replace(/\s+/g, '_'),
        description: formData.description,
        templateText: formData.templateText,
        category: formData.category,
      };

      await createTemplate(request);
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        description: '',
        templateText: '',
        category: 'CUSTOM',
      });
    } catch (err) {
      logger.error('Failed to create template', { error: err });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTemplate) return;

    try {
      const request: UpdateTemplateRequest = {
        description: formData.description,
        templateText: formData.templateText,
      };

      await updateTemplate(selectedTemplate.id, request);
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      logger.error('Failed to update template', {
        templateId: selectedTemplate.id,
        error: err,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      logger.error('Failed to delete template', {
        templateId: selectedTemplate.id,
        error: err,
      });
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Mesaj Şablonları</h1>
          <p className="mt-1 text-gray-600">
            Sık kullandığınız mesajlar için şablonlar oluşturun
          </p>
        </div>
        <Button onClick={handleCreateClick} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Şablon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="">Tüm Kategoriler</option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Hata</h3>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </Card>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 font-semibold text-gray-900">
              Henüz şablon yok
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Yeni bir şablon oluşturarak başlayın
            </p>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {template.description || template.code}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                      {TEMPLATE_CATEGORIES.find(
                        (c) => c.value === template.category
                      )?.label || template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Kod: <code>{template.code}</code>
                  </p>
                  <div className="rounded bg-gray-50 p-3">
                    <p className="text-sm text-gray-700">
                      {template.templateText}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Şablon Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Şablon Kodu *
              </label>
              <Input
                type="text"
                placeholder="MY_TEMPLATE"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Açıklama *
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-md border px-4 py-2"
              >
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Şablon Metni *
              </label>
              <textarea
                value={formData.templateText}
                onChange={(e) =>
                  setFormData({ ...formData, templateText: e.target.value })
                }
                rows={6}
                className="w-full rounded-md border px-4 py-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={
                  !formData.code ||
                  !formData.description ||
                  !formData.templateText
                }
              >
                Oluştur
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Şablonu Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Açıklama *
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Şablon Metni *
              </label>
              <textarea
                value={formData.templateText}
                onChange={(e) =>
                  setFormData({ ...formData, templateText: e.target.value })
                }
                rows={6}
                className="w-full rounded-md border px-4 py-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={!formData.description || !formData.templateText}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şablonu Sil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>{selectedTemplate?.description}</strong> şablonunu silmek
              istediğinizden emin misiniz?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Sil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
