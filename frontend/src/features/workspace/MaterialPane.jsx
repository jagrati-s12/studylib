import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  LoaderCircle,
  Save,
  StickyNote,
} from 'lucide-react';

import DigitalNotesEditor from '@/editors/DigitalNotesEditor';
import { getStudyFile } from '@/lib/file-storage';

const noteKey = (materialId) =>
  `notie_material_note_${materialId}`;

function isTextMaterial(material) {
  const name = material?.title?.toLowerCase() || '';
  const mime = material?.mime_type || '';

  return (
    mime.startsWith('text/') ||
    /\.(txt|md|markdown|csv|json|xml|log|py|js|jsx|ts|tsx|html|css|sql)$/i.test(
      name
    )
  );
}

export default function MaterialPane({
  materialId,
  materials,
  digitalNote,
  onNoteChange,
}) {
  const material = materials.find(
    (item) => item.id === materialId
  );

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [studyNote, setStudyNote] = useState('');
  const [noteStatus, setNoteStatus] = useState('saved');
  const [textContent, setTextContent] = useState('');

  // Load the original file, including files stored in IndexedDB.
  useEffect(() => {
    let cancelled = false;
    let generatedUrl = null;

    setPreviewUrl('');
    setPreviewError('');
    setPreviewLoading(false);

    if (
      !materialId ||
      materialId === 'digital-notes' ||
      !material?.url
    ) {
      return undefined;
    }

    if (material.url.startsWith('idb:')) {
      setPreviewLoading(true);

      getStudyFile(material.url.slice(4))
        .then((fileBlob) => {
          if (cancelled) return;

          if (!fileBlob) {
            setPreviewError(
              'The saved file could not be found. Please upload it again.'
            );
            return;
          }

          generatedUrl = URL.createObjectURL(fileBlob);
          setPreviewUrl(generatedUrl);
        })
        .catch((error) => {
          if (!cancelled) {
            setPreviewError(
              error?.message || 'Could not load this file.'
            );
          }
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    } else {
      // Supports existing sample URLs and older material records.
      setPreviewUrl(material.url);
    }

    return () => {
      cancelled = true;

      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [materialId, material?.url]);

  // Load notes associated with the selected material.
  useEffect(() => {
    if (!materialId || materialId === 'digital-notes') {
      setStudyNote('');
      setNoteStatus('saved');
      return;
    }

    try {
      setStudyNote(
        localStorage.getItem(noteKey(materialId)) || ''
      );
    } catch {
      setStudyNote('');
    }

    setNoteStatus('saved');
  }, [materialId]);

  // Automatically save material-specific notes.
  useEffect(() => {
    if (!materialId || materialId === 'digital-notes') {
      return undefined;
    }

    setNoteStatus('saving');

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(noteKey(materialId), studyNote);
        setNoteStatus('saved');
      } catch {
        setNoteStatus('error');
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [materialId, studyNote]);

  // Load plain-text and code-file previews.
  useEffect(() => {
    let cancelled = false;

    if (!previewUrl || !isTextMaterial(material)) {
      setTextContent('');
      return undefined;
    }

    fetch(previewUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to read this file.');
        }

        return response.text();
      })
      .then((text) => {
        if (!cancelled) setTextContent(text);
      })
      .catch(() => {
        if (!cancelled) {
          setTextContent(
            'Preview unavailable. Use Open or Download to view the file.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewUrl, material?.title, material?.mime_type]);

  // Rich-text notes for the current topic.
  if (materialId === 'digital-notes') {
    return (
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-surface-700">
            <StickyNote
              size={16}
              className="text-primary-600"
            />
            Topic digital notes
          </span>

          <span className="text-xs text-surface-400">
            Auto-saves
          </span>
        </div>

        <div className="h-[calc(100%-2rem)] min-h-0">
          <DigitalNotesEditor
            content={digitalNote?.content ?? null}
            onUpdate={onNoteChange}
          />
        </div>
      </div>
    );
  }

  if (!materialId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-surface-400">
        <StickyNote size={42} strokeWidth={1.5} />

        <p className="text-sm">
          Choose a PDF, document, image, video, or Digital Notes
          from the panel selector.
        </p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-surface-400">
        Material not found. Select it again from the panel selector.
      </div>
    );
  }

  const fallback = (message) => (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <FileText size={42} className="text-surface-400" />

      <h3 className="max-w-full break-words font-semibold text-surface-700">
        {material.title}
      </h3>

      <p className="max-w-md text-sm text-surface-500">
        {message}
      </p>

      {previewUrl && (
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
          >
            <ExternalLink size={14} className="mr-1 inline" />
            Open in new tab
          </a>

          <a
            href={previewUrl}
            download={material.title}
            className="rounded-lg border border-surface-200 px-3 py-2 text-sm"
          >
            <Download size={14} className="mr-1 inline" />
            Download
          </a>
        </div>
      )}

      {!previewUrl && !previewLoading && (
        <p className="text-xs text-amber-600">
          This sample has metadata only. Upload the actual file to preview it.
        </p>
      )}
    </div>
  );

  if (previewLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-surface-500">
        <LoaderCircle size={18} className="animate-spin" />
        Opening {material.title}…
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-amber-700">
        <AlertCircle size={28} />
        <p>{previewError}</p>
      </div>
    );
  }

  if (!previewUrl) {
    return fallback(
      'A preview is not available until the original file is uploaded.'
    );
  }

  // Embedded PDF reader with notes beneath the document.
  if (
    material.material_type === 'pdf' ||
    material.mime_type === 'application/pdf' ||
    /\.pdf$/i.test(material.title)
  ) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex min-h-0 flex-1 flex-col">
          <iframe
            title={material.title}
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            className="h-full min-h-0 w-full flex-1 border-0"
          />
        </div>

        <section className="max-h-48 shrink-0 border-t border-primary-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor={`study-note-${material.id}`}
              className="flex items-center gap-2 text-sm font-semibold text-surface-700"
            >
              <StickyNote size={15} className="text-primary-600" />
              Notes for this PDF
            </label>

            <span
              className={`text-[11px] ${
                noteStatus === 'error'
                  ? 'text-red-600'
                  : 'text-surface-400'
              }`}
            >
              {noteStatus === 'saving'
                ? 'Saving…'
                : noteStatus === 'error'
                  ? 'Could not save locally'
                  : (
                    <>
                      <Save size={12} className="mr-1 inline" />
                      Saved locally
                    </>
                  )}
            </span>
          </div>

          <textarea
            id={`study-note-${material.id}`}
            value={studyNote}
            onChange={(event) => setStudyNote(event.target.value)}
            placeholder="Add page references, key points, questions, or a quick summary…"
            className="min-h-16 max-h-32 w-full resize-y rounded-lg border border-surface-200 bg-white p-2.5 text-sm text-surface-700 outline-none placeholder:text-surface-400 focus:border-primary-400"
          />
        </section>
      </div>
    );
  }

  // Image and handwritten-note preview.
  if (
    material.material_type === 'handwritten_image' ||
    material.mime_type?.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(material.title)
  ) {
    return (
      <div className="h-full overflow-auto bg-surface-100 p-4">
        <img
          src={previewUrl}
          alt={material.title}
          className="mx-auto max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  // Video preview.
  if (
    material.material_type === 'video' ||
    material.mime_type?.startsWith('video/')
  ) {
    return (
      <video
        controls
        className="h-full w-full bg-black"
        src={previewUrl}
      >
        Your browser cannot play this video.
      </video>
    );
  }

  // Audio preview.
  if (
    material.mime_type?.startsWith('audio/') ||
    /\.(mp3|wav|m4a|ogg)$/i.test(material.title)
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <StickyNote size={42} className="text-primary-500" />
        <h3 className="font-semibold">{material.title}</h3>
        <audio controls src={previewUrl} className="w-full max-w-xl" />
      </div>
    );
  }

  // Text, Markdown, CSV, JSON, and code files.
  if (isTextMaterial(material)) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-surface-200 px-3 py-2 text-sm font-semibold text-surface-700">
          {material.title}
        </div>

        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-surface-700">
          {textContent || 'Loading text preview…'}
        </pre>
      </div>
    );
  }

  if (
    material.material_type === 'ppt' ||
    /\.(ppt|pptx)$/i.test(material.title)
  ) {
    return fallback(
      'PowerPoint files can be opened or downloaded. Inline slide previews require a PowerPoint renderer or conversion service.'
    );
  }

  return fallback(
    'This file type does not have an inline preview yet. You can still open or download the original file.'
  );
}