'use client';

import { Dialog } from '@/components/ui/Dialog';
import { Archive, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmArchiveModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Archive className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Konuşmayı Arşivle
            </h3>
            <p className="text-sm text-gray-600">Bu işlem geri alınabilir</p>
          </div>
        </div>

        <p className="text-gray-700">
          Bu konuşma arşivlenecek ve ana listede görünmeyecek. Arşivlenmiş
          konuşmalara erişmeye devam edebilirsiniz.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {isLoading ? 'Arşivleniyor...' : 'Arşivle'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ConfirmUnarchiveModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Archive className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Arşivden Çıkar
            </h3>
            <p className="text-sm text-gray-600">Konuşma ana listeye dönecek</p>
          </div>
        </div>

        <p className="text-gray-700">
          Bu konuşma arşivden çıkarılacak ve ana konuşma listesinde yeniden
          görünecek.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Çıkarılıyor...' : 'Arşivden Çıkar'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Konuşmayı Sil
            </h3>
            <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700">
            Bu konuşmayı silmek istediğinizden emin misiniz?
          </p>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">
              <strong>Uyarı:</strong> Bu işlem sadece sizin için konuşmayı
              kaldırır. Karşı taraf konuşmayı görmeye devam edecektir.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Siliniyor...' : 'Sil'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
