import { FileText, Image, StickyNote } from 'lucide-react';
import type { Material, DigitalNote } from '@/types';
import DigitalNotesEditor from '@/editors/DigitalNotesEditor';

interface MaterialPaneProps {
  materialId: string | null;
  materials: Material[];
  digitalNote: DigitalNote | null;
  onNoteChange: (content: Record<string, unknown>) => void;
}

export default function MaterialPane({
  materialId,
  materials,
  digitalNote,
  onNoteChange,
}: MaterialPaneProps) {
  // Digital notes pseudo-material
  if (materialId === 'digital-notes') {
    return (
      <div className="h-full p-4">
        <DigitalNotesEditor
          content={digitalNote?.content ?? null}
          onUpdate={onNoteChange}
        />
      </div>
    );
  }

  // Nothing selected
  if (!materialId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-surface-400 gap-3">
        <StickyNote size={48} strokeWidth={1.5} />
        <p className="text-sm">Select a material to view</p>
      </div>
    );
  }

  // Look up the real material
  const material = materials.find(m => m.id === materialId);

  if (!material) {
    return (
      <div className="h-full flex items-center justify-center text-surface-400 text-sm">
        Material not found
      </div>
    );
  }

  // PDF placeholder
  if (material.material_type === 'pdf') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-full max-w-lg border-2 border-dashed border-surface-300 rounded-xl p-10 flex flex-col items-center gap-4 bg-surface-50">
          <FileText size={56} className="text-primary-400" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-surface-700">{material.title}</h3>
          {material.page_count && (
            <p className="text-sm text-surface-500">{material.page_count} pages</p>
          )}
          <p className="text-xs text-surface-400 mt-2">PDF viewer will render here</p>
        </div>
      </div>
    );
  }

  // Handwritten image placeholder
  if (material.material_type === 'handwritten_image') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-full max-w-lg border-2 border-dashed border-surface-300 rounded-xl p-10 flex flex-col items-center gap-4 bg-surface-50">
          <Image size={56} className="text-teal-400" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-surface-700">{material.title}</h3>
          <p className="text-xs text-surface-400 mt-2">Image viewer will render here</p>
        </div>
      </div>
    );
  }

  // Generic attachment fallback
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-full max-w-lg border-2 border-dashed border-surface-300 rounded-xl p-10 flex flex-col items-center gap-4 bg-surface-50">
        <FileText size={56} className="text-surface-400" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-surface-700">{material.title}</h3>
        <p className="text-xs text-surface-400 mt-2">Preview not available</p>
      </div>
    </div>
  );
}
