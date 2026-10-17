import { useState } from 'react';
import {
  PanelLeft,
  Columns2,
  Columns3,
  Grid2X2,
  Upload,
  Check,
  LoaderCircle,
  AlertCircle,
  X,
  FolderOpen,
} from 'lucide-react';

import { FileUpload } from '@/components/FileUpload';

const panelCount = (layout) =>
  ({ single: 1, split: 2, triple: 3, quad: 4 }[layout] || 1);

const layouts = [
  ['single', PanelLeft, 'Single screen'],
  ['split', Columns2, 'Double screen'],
  ['triple', Columns3, 'Triple screen'],
  ['quad', Grid2X2, 'Quad screen'],
];

export function WorkspaceToolbar({
  layout,
  onLayoutChange,
  materials,
  panelIds,
  onPanelChange,
  saveStatus,
  onUpload,
  onBackToLibrary,
}) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-surface-200 bg-white px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onBackToLibrary}
          className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-semibold text-surface-600 hover:bg-surface-50"
          title="Back to topic library"
        >
          <FolderOpen size={15} />
          Library
        </button>

        <div
          className="flex overflow-hidden rounded-lg border border-surface-200"
          aria-label="Workspace layout"
        >
          {layouts.map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => onLayoutChange(key)}
              className={`p-2 transition-colors ${
                layout === key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-surface-500 hover:bg-surface-100'
              }`}
            >
              <Icon size={17} />
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {Array.from({ length: panelCount(layout) }, (_, index) => (
            <label
              key={index}
              className="flex min-w-0 items-center gap-1 text-xs text-surface-500"
            >
              <span className="shrink-0">Pane {index + 1}</span>

              <select
                value={panelIds[index] ?? ''}
                onChange={(event) =>
                  onPanelChange(index, event.target.value || null)
                }
                className="max-w-44 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-700"
              >
                <option value="">Choose material…</option>
                <option value="digital-notes">Digital Notes</option>

                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                aria-label={`Clear pane ${index + 1}`}
                title="Clear pane"
                onClick={() => onPanelChange(index, null)}
                className="rounded px-1 text-surface-400 hover:bg-surface-100 hover:text-red-500"
              >
                ×
              </button>
            </label>
          ))}
        </div>

        <span
          className={`inline-flex items-center gap-1 text-xs ${
            saveStatus === 'saved'
              ? 'text-green-600'
              : saveStatus === 'saving'
                ? 'text-primary-600'
                : 'text-amber-600'
          }`}
          role="status"
        >
          {saveStatus === 'saving' ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check size={14} />
          ) : (
            <AlertCircle size={14} />
          )}

          {saveStatus}
        </span>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
        >
          <Upload size={15} />
          Upload
        </button>
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-800">
                Upload study material
              </h3>

              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                aria-label="Close upload"
                className="rounded p-1 text-surface-500 hover:bg-surface-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-surface-500">
              New uploads are stored in this browser so they remain available
              after refreshing this page.
            </p>

            <FileUpload
              accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mp3,.wav,.m4a,.ogg,.txt,.md,.csv,.json,.xml,.log,.py,.js,.jsx,.ts,.tsx,.html,.css,.sql"
              onFilesSelected={(files) => {
                onUpload?.(files);
                setUploadOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default WorkspaceToolbar;