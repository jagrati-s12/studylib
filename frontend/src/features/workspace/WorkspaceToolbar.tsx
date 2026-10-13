import { useState } from 'react';
import {
  PanelLeft,
  Columns2,
  Upload,
  Check,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import type { Material, WorkspaceLayoutMode } from '@/types';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface WorkspaceToolbarProps {
  layout: WorkspaceLayoutMode;
  onLayoutChange: (layout: WorkspaceLayoutMode) => void;
  materials: Material[];
  leftMaterialId: string | null;
  rightMaterialId: string | null;
  onLeftChange: (id: string | null) => void;
  onRightChange: (id: string | null) => void;
  saveStatus: SaveStatus;
  onUpload?: (files: File[]) => void;
}

function MaterialSelect({
  label,
  value,
  materials,
  onChange,
}: {
  label: string;
  value: string | null;
  materials: Material[];
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
        {label}
      </span>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="text-sm border border-surface-200 rounded-md px-2 py-1 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-300 max-w-[200px] truncate"
      >
        <option value="">— Select —</option>
        <option value="digital-notes">📝 Digital Notes</option>
        {materials.map(m => (
          <option key={m.id} value={m.id}>
            {m.material_type === 'pdf' ? '📄 ' : '🖼️ '}
            {m.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saved':
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <Check size={14} /> Saved
        </span>
      );
    case 'saving':
      return (
        <span className="flex items-center gap-1 text-xs text-primary-600">
          <Loader2 size={14} className="animate-spin" /> Saving…
        </span>
      );
    case 'unsaved':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle size={14} /> Unsaved changes
        </span>
      );
  }
}

export default function WorkspaceToolbar({
  layout,
  onLayoutChange,
  materials,
  leftMaterialId,
  rightMaterialId,
  onLeftChange,
  onRightChange,
  saveStatus,
  onUpload,
}: WorkspaceToolbarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  function handleFilesSelected(files: File[]) {
    onUpload?.(files);
    setModalOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-surface-200 bg-white">
        {/* Layout toggle */}
        <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onLayoutChange('single')}
            title="Single panel"
            className={`p-1.5 transition-colors ${
              layout === 'single'
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-500 hover:bg-surface-100'
            }`}
          >
            <PanelLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('split')}
            title="Split view"
            className={`p-1.5 transition-colors ${
              layout === 'split'
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-500 hover:bg-surface-100'
            }`}
          >
            <Columns2 size={18} />
          </button>
        </div>

        {/* Material selectors */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <MaterialSelect
            label={layout === 'split' ? 'Left' : 'Panel'}
            value={leftMaterialId}
            materials={materials}
            onChange={onLeftChange}
          />
          {layout === 'split' && (
            <MaterialSelect
              label="Right"
              value={rightMaterialId}
              materials={materials}
              onChange={onRightChange}
            />
          )}
        </div>

        {/* Save status */}
        <SaveIndicator status={saveStatus} />

        {/* Upload */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Upload material"
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">
                Upload Study Material
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <FileUpload onFilesSelected={handleFilesSelected} />
          </div>
        </div>
      )}
    </>
  );
}
