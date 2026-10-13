import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';
import { useEffect } from 'react';

interface DigitalNotesEditorProps {
  content: Record<string, unknown> | null;
  onUpdate: (json: Record<string, unknown>) => void;
}

export default function DigitalNotesEditor({ content, onUpdate }: DigitalNotesEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start typing your notes...' }),
      Underline,
    ],
    content: content ?? undefined,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getJSON() as Record<string, unknown>);
    },
  });

  // Sync external content changes (e.g. switching topics)
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(content ?? { type: 'doc', content: [] });
    if (current !== next) {
      editor.commands.setContent(content ?? { type: 'doc', content: [] });
    }
    // Only react to the serialised content identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, JSON.stringify(content)]);

  if (!editor) return null;

  const btnBase =
    'p-1.5 rounded hover:bg-surface-200 text-surface-600 transition-colors';
  const btnActive = 'bg-primary-100 text-primary-700';

  const actions: { icon: React.ElementType; label: string; active: boolean; run: () => void }[] = [
    { icon: Bold, label: 'Bold', active: editor.isActive('bold'), run: () => { editor.chain().focus().toggleBold().run(); } },
    { icon: Italic, label: 'Italic', active: editor.isActive('italic'), run: () => { editor.chain().focus().toggleItalic().run(); } },
    { icon: UnderlineIcon, label: 'Underline', active: editor.isActive('underline'), run: () => { editor.chain().focus().toggleUnderline().run(); } },
    { icon: Strikethrough, label: 'Strikethrough', active: editor.isActive('strike'), run: () => { editor.chain().focus().toggleStrike().run(); } },
    { icon: Heading1, label: 'Heading 1', active: editor.isActive('heading', { level: 1 }), run: () => { editor.chain().focus().toggleHeading({ level: 1 }).run(); } },
    { icon: Heading2, label: 'Heading 2', active: editor.isActive('heading', { level: 2 }), run: () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); } },
    { icon: Heading3, label: 'Heading 3', active: editor.isActive('heading', { level: 3 }), run: () => { editor.chain().focus().toggleHeading({ level: 3 }).run(); } },
    { icon: List, label: 'Bullet List', active: editor.isActive('bulletList'), run: () => { editor.chain().focus().toggleBulletList().run(); } },
    { icon: ListOrdered, label: 'Ordered List', active: editor.isActive('orderedList'), run: () => { editor.chain().focus().toggleOrderedList().run(); } },
    { icon: Quote, label: 'Blockquote', active: editor.isActive('blockquote'), run: () => { editor.chain().focus().toggleBlockquote().run(); } },
    { icon: Code, label: 'Code', active: editor.isActive('code'), run: () => { editor.chain().focus().toggleCode().run(); } },
    { icon: Undo, label: 'Undo', active: false, run: () => { editor.chain().focus().undo().run(); } },
    { icon: Redo, label: 'Redo', active: false, run: () => { editor.chain().focus().redo().run(); } },
  ];

  return (
    <div className="flex flex-col h-full border border-surface-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-surface-200 bg-surface-50">
        {actions.map(({ icon: Icon, label, active, run }, i) => (
          <button
            key={label}
            type="button"
            onClick={run}
            title={label}
            className={`${btnBase} ${active ? btnActive : ''} ${
              /* separator before Undo */ i === actions.length - 2 ? 'ml-auto' : ''
            }`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
