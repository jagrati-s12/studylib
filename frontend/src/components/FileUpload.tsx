import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUpload({
  onFilesSelected,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFilesSelected(Array.from(fileList));
    },
    [onFilesSelected],
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        dragOver
          ? 'border-primary-400 bg-primary-50 text-primary-600'
          : 'border-surface-300 bg-surface-50 text-surface-500 hover:border-primary-300 hover:bg-primary-50/30'
      }`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
          dragOver ? 'bg-primary-100' : 'bg-surface-200'
        }`}
      >
        <Upload className="w-6 h-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {dragOver ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-xs text-surface-400 mt-1">
          or click to browse &middot; Accepts {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={e => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
