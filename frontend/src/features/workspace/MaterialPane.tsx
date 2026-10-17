import { FileText, StickyNote, ExternalLink, Download } from 'lucide-react';
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

  const fallback = (message: string) => <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center"><FileText size={48} className="text-surface-400"/><h3 className="font-semibold text-surface-700">{material.title}</h3><p className="text-sm text-surface-500">{message}</p>{material.url ? <div className="flex gap-2"><a href={material.url} target="_blank" rel="noreferrer" className="rounded border px-3 py-2 text-sm"><ExternalLink size={14} className="inline"/> Open</a><a href={material.url} download={material.title} className="rounded border px-3 py-2 text-sm"><Download size={14} className="inline"/> Download</a></div> : <p className="text-xs text-amber-600">This sample item has metadata only; upload the source file to preview it.</p>}</div>;

  // Browser-native PDF reader for readable uploaded object URLs.
  if (material.material_type === 'pdf') {
    return material.url ? <iframe title={material.title} src={material.url} className="h-full w-full border-0" /> : fallback('A readable PDF file is not available for this sample material.');
  }

  // Handwritten image placeholder
  if (material.material_type === 'handwritten_image') {
    return material.url ? <div className="h-full overflow-auto bg-surface-100 p-4"><img src={material.url} alt={material.title} className="mx-auto max-w-full" /></div> : fallback('A readable image file is not available for this sample material.');
  }

  if (material.material_type === 'video') return material.url ? <video controls className="h-full w-full bg-black" src={material.url}>Your browser cannot play this video.</video> : fallback('Upload the video again to play it in this prototype.');
  if (material.material_type === 'ppt') return fallback('PPT/PPTX cannot be rendered natively by this browser. Use Open or Download.');

  // Generic attachment fallback
  return fallback('Preview is not available for this file type.');
}
