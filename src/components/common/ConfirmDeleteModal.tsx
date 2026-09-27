import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  confirmLabel = 'Hapus Sekarang',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-normal">
            {message}
          </p>
          {itemName && (
            <div className="p-2 rounded bg-neutral-50 border border-neutral-100 font-mono text-xs text-neutral-800 break-all font-medium">
              {itemName}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-3.5 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
