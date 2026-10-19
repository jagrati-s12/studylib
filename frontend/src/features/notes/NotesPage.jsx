import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ArrowLeft,
  Plus,
  LayoutGrid,
  Table2,
  Upload,
  FileText,
  Image,
  Presentation,
  MessageSquare,
  Columns2,
  Columns3,
  ChevronRight,
  ChevronDown,
  Trash2,
  X,
  ArrowUpRight,
  FolderOpen,
  Eye,
  Folder,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';


// Icons available for subject icon picker
const ICON_OPTIONS = [
  'Database', 'Brain', 'Server', 'Monitor', 'Wifi',
  'BookOpen', 'GraduationCap', 'FlaskConical', 'Atom', 'Calculator',
  'Code', 'Globe', 'Cpu', 'HardDrive', 'Network',
  'Lightbulb', 'Microscope', 'PenTool', 'Music', 'Camera',
] ;

// Subject colors from the user request palette
const SUBJECT_PALETTE = {
  fern: '#768E78',
  pistachio: '#C6C09C',
  fennel: '#EBDEC0',
  cherryBlossom: '#FECDBE',
  peony: '#E79897',
  bluebell: '#B7CBDB',
  honey: '#FCC88A',
  clockwork: '#72583E',
  cedar: '#7C7960',
  latte: '#DBC4A5',
  deepOlive: '#44422D',
  mauve: '#755151',
  weathered: '#A08670',
  linen: '#FFF9F3',
  cafeNoir: '#443223',
};

function getIconComponent(iconName) {
  if (!iconName) return BookOpen;
  const icons = LucideIcons;
  return icons[iconName] || BookOpen;
}

function getMaterialIcon(type) {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'ppt':
      return Presentation;
    case 'handwritten_image':
      return Image;
    case 'chatbot_note':
      return MessageSquare;
    default:
      return FileText;
  }
}

function getMaterialLabel(type) {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'ppt':
      return 'PPT';
    case 'handwritten_image':
      return 'Handwritten';
    case 'chatbot_note':
      return 'Chatbot Notes';
    default:
      return 'File';
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}



export default function NotesPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  // Drill-down state
  const [activeSubject, setActiveSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Split-screen workspace state
  const [activeTopic, setActiveTopic] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [splitCount, setSplitCount] = useState(2);
  const [openPanes, setOpenPanes] = useState([null, null]);
  const [filePickerPane, setFilePickerPane] = useState(null);
  const [pickerSubjectId, setPickerSubjectId] = useState('');
  const [pickerTopics, setPickerTopics] = useState([]);
  const [pickerTopicId, setPickerTopicId] = useState('');
  const [pickerMaterials, setPickerMaterials] = useState([]);
  const [pickerFolder, setPickerFolder] = useState('All files');
  const fileInputRef = useRef(null);
  const [uploadTargetPane, setUploadTargetPane] = useState(null);

  // Icon picker state & New Subject Modal & New Topic Modal & Subtopic Modal
  const [iconPickerSubject, setIconPickerSubject] = useState(null);
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [subtopicParent, setSubtopicParent] = useState(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Nested folders state inside Materials
  const [customFolders, setCustomFolders] = useState(['Chapter 1 Notes', 'Extra References', 'Problem Sets']);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    api.getSubjects().then(async (data) => {
      setSubjects(data);
      setLoading(false);

      // Check URL query parameters for deep linking (e.g. ?subjectId=...&topicId=...)
      const params = new URLSearchParams(window.location.search);
      const subjectId = params.get('subjectId');
      const topicId = params.get('topicId');
      if (subjectId) {
        const targetSub = data.find((s) => s.id === subjectId) || data[0];
        if (targetSub) {
          setActiveSubject(targetSub);
          setTopicsLoading(true);
          const topicList = await api.getTopics(targetSub.id);
          setTopics(topicList);
          setTopicsLoading(false);
          if (topicId) {
            const targetTopic = topicList.find((t) => t.id === topicId);
            if (targetTopic) {
              setActiveTopic(targetTopic);
              const mats = await api.getMaterials(targetTopic.id);
              setMaterials(mats);
              setOpenPanes([null, null]);
              setSplitCount(1);
            }
          }
        }
      }
    });
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [subjects, searchQuery]);

  async function openSubject(subject) {
    setActiveSubject(subject);
    setTopicsLoading(true);
    setActiveTopic(null);
    setMaterials([]);
    setActiveFolder(null);
    const data = await api.getTopics(subject.id);
    setTopics(data);
    setTopicsLoading(false);
  }

  async function openTopic(topic) {
    navigate(`/subjects/${activeSubject.id}/topics/${topic.id}`);
  }

  function openInPane(item, paneIdx) {
    setOpenPanes((prev) => {
      const next = [...prev];
      next[paneIdx] = item;
      return next;
    });
  }

  function updateSplitCount(count) {
    setSplitCount(count);
    setOpenPanes((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(null);
      return next.slice(0, count);
    });
  }

  async function choosePickerSubject(id) {
    setPickerSubjectId(id); setPickerTopicId(''); setPickerMaterials([]); setPickerFolder('All files');
    setPickerTopics(id ? await api.getTopics(id) : []);
  }

  async function choosePickerIndex(id) {
    setPickerTopicId(id); setPickerFolder('All files');
    setPickerMaterials(id ? await api.getMaterials(id) : []);
  }

  function openFilePicker(paneIndex) {
    setFilePickerPane(paneIndex);
    setPickerSubjectId(activeSubject?.id ?? '');
    setPickerTopics(topics);
    setPickerTopicId(activeTopic?.id ?? '');
    setPickerMaterials(materials);
    setPickerFolder('All files');
  }

  async function uploadIntoPane(files) {
    if (!files?.length || !activeTopic || uploadTargetPane === null) return;
    const file = files[0];
    const material = await api.uploadMaterial(activeTopic.id, { name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file) });
    setMaterials(previous => [...previous, material]);
    openInPane(material, uploadTargetPane);
    setUploadTargetPane(null);
  }

  async function handleIconChange(subjectId, iconName) {
    try {
      await api.updateSubject(subjectId, { icon: iconName });
      setSubjects((prev) =>
        prev.map((s) => (s.id === subjectId ? { ...s, icon: iconName } : s))
      );
      if (activeSubject?.id === subjectId) {
        setActiveSubject((prev) => (prev ? { ...prev, icon: iconName } : prev));
      }
    } catch (err) {
      console.error('Failed to update icon:', err);
    }
    setIconPickerSubject(null);
  }

  // ── Workspace / Split-Screen View ─────────────────────
  if (activeTopic && activeSubject) {
    const folderCards = [
      { name: 'PDFs', color: 'bg-sky-500', icon: FileText },
      { name: 'PPTs', color: 'bg-amber-400', icon: Presentation },
      { name: 'Digital Notes', color: 'bg-violet-400', icon: FileText },
      { name: 'Handwritten Notes', color: 'bg-emerald-500', icon: Image },
      { name: 'AI Notes', color: 'bg-orange-400', icon: MessageSquare },
      { name: 'Others', color: 'bg-slate-500', icon: Folder },
      ...customFolders.map((name, index) => ({ name, color: ['bg-pink-400', 'bg-teal-500', 'bg-indigo-400'][index % 3], icon: Folder })),
    ];
    const categoryMaterials = activeFolder === 'PDFs' ? materials.filter(item => item.material_type === 'pdf')
      : activeFolder === 'PPTs' ? materials.filter(item => item.material_type === 'ppt')
      : activeFolder === 'Handwritten Notes' ? materials.filter(item => item.material_type === 'handwritten_image')
      : activeFolder === 'Others' ? materials.filter(item => ['attachment', 'video', 'link'].includes(item.material_type))
      : [];

    // Opening an index immediately opens the split-screen view with the first PDF or document open in panel 1.
    if (openPanes.every(pane => pane === null) && materials.length > 0) {
      // Auto-open first material in pane 0 if none open
      // We can let it fall through to the split view
    }
    return (
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
        }`}
      >
        {/* Workspace header */}
        <div
          className={`flex items-center gap-3 px-6 py-3 border-b ${
            isDark ? 'border-[#7B694E]/30 bg-[#3B1319]' : 'border-[#F7C8D3]/60 bg-white'
          }`}
        >
          <button
            onClick={() => setActiveTopic(null)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#7B694E]/30 text-[#C6B39A]' : 'hover:bg-[#F7C8D3]/30 text-[#B46A72]'
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-60">{activeSubject.name} {activeFolder ? `> ${activeFolder}` : ''}</p>
            <h2 className="font-display font-bold text-lg truncate">Index {activeTopic.serial_number}: {activeTopic.title}</h2>
          </div>

          {/* Split controls */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg ${
              isDark ? 'bg-[#280B0F]' : 'bg-[#F7C8D3]/20'
            }`}
          >
            {[1, 2, 3, 4].map((n) => {
              const Icon = n === 1 ? Eye : n === 2 ? Columns2 : Columns3;
              return (
                <button
                  key={n}
                  onClick={() => updateSplitCount(n)}
                  title={n === 1 ? 'Single' : `${n}-pane split`}
                  className={`p-1.5 rounded-md text-xs font-bold transition-colors ${
                    splitCount === n
                      ? 'bg-[#B46A72] text-white'
                      : isDark
                      ? 'text-[#C6B39A] hover:bg-[#7B694E]/30'
                      : 'text-[#2D3A47] hover:bg-[#F7C8D3]/40'
                  }`}
                >
                  {n <= 3 ? <Icon size={16} /> : <span className="px-1">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Material sidebar with Folders */}
          {filePickerPane === -1 && <aside
            className={`w-64 shrink-0 border-r overflow-y-auto ${
              isDark ? 'border-[#7B694E]/30 bg-[#280B0F]' : 'border-[#F7C8D3]/40 bg-[#FFF5F6]'
            }`}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold opacity-60 uppercase tracking-wide">Materials & Folders</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-[#3B1319] text-[#C6B39A]' : 'hover:bg-[#F7C8D3]/30 text-[#B46A72]'
                    }`}
                    title="Add folder"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-[#3B1319] text-[#C6B39A]' : 'hover:bg-[#F7C8D3]/30 text-[#B46A72]'
                    }`}
                    title="Upload file"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </div>

              {/* New Folder Input form */}
              {showNewFolderInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                      isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
                    }`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newFolderName.trim()) {
                        setCustomFolders([...customFolders, newFolderName.trim()]);
                        setNewFolderName('');
                        setShowNewFolderInput(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newFolderName.trim()) {
                        setCustomFolders([...customFolders, newFolderName.trim()]);
                        setNewFolderName('');
                        setShowNewFolderInput(false);
                      }
                    }}
                    className="px-2 py-1 bg-[#B46A72] text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Folder list */}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveFolder(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                    activeFolder === null
                      ? 'bg-[#B46A72] text-white'
                      : isDark
                      ? 'hover:bg-[#3B1319] text-[#C6B39A]'
                      : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                  }`}
                >
                  <FolderOpen size={14} />
                  <span>All Files</span>
                </button>

                {customFolders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      activeFolder === folder
                        ? 'bg-[#B46A72] text-white'
                        : isDark
                        ? 'hover:bg-[#3B1319] text-[#C6B39A]'
                        : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                    }`}
                  >
                    <Folder size={14} />
                    <span className="truncate">{folder}</span>
                  </button>
                ))}
              </div>

              {/* Digital notes shortcut */}
              <div className="pt-2 border-t border-inherit">
                <button
                  onClick={() => openInPane('notes', 0)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2 text-xs font-semibold transition-colors text-left ${
                    isDark
                      ? 'bg-[#3B1319] hover:bg-[#7B694E]/30 text-[#C6B39A]'
                      : 'bg-white hover:bg-[#F7C8D3]/20 text-[#B46A72] border border-[#F7C8D3]/40'
                  }`}
                >
                  <FileText size={14} />
                  Digital Notes
                </button>

                {/* Material list */}
                <div className="space-y-1">
                  {materials
                    .filter(() => true)
                    .map((mat) => {
                      const MatIcon = getMaterialIcon(mat.material_type);
                      return (
                        <button
                          key={mat.id}
                          onClick={() => {
                            const emptyIdx = openPanes.findIndex((p) => p === null);
                            openInPane(mat, emptyIdx >= 0 ? emptyIdx : 0);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                            isDark
                              ? 'hover:bg-[#3B1319] text-[#F7EFE6]'
                              : 'hover:bg-[#F7C8D3]/20 text-[#2D3A47]'
                          }`}
                        >
                          <MatIcon size={14} className="shrink-0 opacity-60" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{mat.title}</p>
                            <p className="opacity-50 text-[10px]">
                              {getMaterialLabel(mat.material_type)} · {formatFileSize(mat.file_size_bytes)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </aside>}

          {/* Split panes */}
          <div className="flex-1 flex overflow-hidden">
            {openPanes.slice(0, splitCount).map((pane, idx) => (
              <div
                key={idx}
                className={`flex-1 flex flex-col border-r last:border-0 ${
                  isDark ? 'border-[#7B694E]/20' : 'border-[#F7C8D3]/30'
                }`}
              >
                {pane === null ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col gap-2"><button type="button" onClick={() => openFilePicker(idx)} className="rounded-xl border border-dashed border-current px-6 py-4 text-center opacity-60 hover:opacity-100"><FolderOpen size={28} className="mx-auto mb-2"/><p className="text-sm font-semibold">Open a file</p><p className="mt-1 text-xs">Choose subject, index, folder, and file</p></button><button type="button" onClick={() => { setUploadTargetPane(idx); fileInputRef.current?.click(); }} className="rounded-lg border px-4 py-2 text-sm opacity-70 hover:opacity-100"><Upload size={15} className="mr-1 inline"/>Add a file</button></div>
                  </div>
                ) : pane === 'notes' ? (
                  <div className="flex-1 flex flex-col">
                    <div
                      className={`flex items-center justify-between px-4 py-2 border-b ${
                        isDark ? 'border-[#7B694E]/30 bg-[#3B1319]/50' : 'border-[#F7C8D3]/40 bg-white/50'
                      }`}
                    >
                      <span className="text-xs font-bold">Digital Notes</span>
                      <button
                        onClick={() => openInPane(null, idx)}
                        className="p-1 rounded hover:bg-black/5"
                      >
                        <X size={14} className="opacity-60" />
                      </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                      <h3 className="text-lg font-bold mb-3">Topic Notes & Summary</h3>
                      <p className="text-sm opacity-80 leading-relaxed">
                        Write and edit your notes here. Supports rich formatting, bullet points, code snippets, and citations from your PDF/lecture materials.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div
                      className={`flex items-center justify-between px-4 py-2 border-b ${
                        isDark ? 'border-[#7B694E]/30 bg-[#3B1319]/50' : 'border-[#F7C8D3]/40 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                          const MatIcon = getMaterialIcon(pane.material_type);
                          return <MatIcon size={14} className="opacity-60 shrink-0" />;
                        })()}
                        <span className="text-xs font-bold truncate">{pane.title}</span>
                      </div>
                      <button
                        onClick={() => {
                          setOpenPanes((prev) => {
                            const next = [...prev];
                            next[idx] = null;
                            return next;
                          });
                        }}
                        className="p-1 rounded hover:bg-black/5"
                      >
                        <X size={14} className="opacity-60" />
                      </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center opacity-40">
                        {(() => {
                          const MatIcon = getMaterialIcon(pane.material_type);
                          return <MatIcon size={48} className="mx-auto mb-3" />;
                        })()}
                        <p className="text-sm font-semibold">{pane.title}</p>
                        <p className="text-xs mt-1">
                          {getMaterialLabel(pane.material_type)} · {formatFileSize(pane.file_size_bytes)}
                          {pane.page_count ? ` · ${pane.page_count} pages` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {filePickerPane !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-[#3B1319] text-[#F7EFE6]' : 'bg-white text-[#2D3A47]'}`}>
            <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold">Open a file in panel {filePickerPane + 1}</h3><p className="text-sm opacity-60">Choose where the file is stored.</p></div><button onClick={() => setFilePickerPane(null)} className="rounded p-2 hover:bg-black/5" aria-label="Close"><X size={18}/></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">1. Subject<select value={pickerSubjectId} onChange={event => choosePickerSubject(event.target.value)} className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2"><option value="">Choose subject</option>{subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
              <label className="text-sm font-medium">2. Index / chapter<select value={pickerTopicId} disabled={!pickerSubjectId} onChange={event => choosePickerIndex(event.target.value)} className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"><option value="">Choose index</option>{pickerTopics.map(topic => <option key={topic.id} value={topic.id}>#{topic.serial_number} {topic.title}</option>)}</select></label>
              <label className="text-sm font-medium sm:col-span-2">3. Folder<select value={pickerFolder} onChange={event => setPickerFolder(event.target.value)} disabled={!pickerTopicId} className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"><option>All files</option><option>PDFs</option><option>PPTs</option><option>Handwritten Notes</option><option>Others</option></select></label>
            </div>
            <div className="mt-5"><p className="mb-2 text-sm font-medium">4. Choose file</p><div className="max-h-56 space-y-2 overflow-y-auto">{pickerMaterials.filter(item => pickerFolder === 'All files' || (pickerFolder === 'PDFs' && item.material_type === 'pdf') || (pickerFolder === 'PPTs' && item.material_type === 'ppt') || (pickerFolder === 'Handwritten Notes' && item.material_type === 'handwritten_image') || (pickerFolder === 'Others' && !['pdf','ppt','handwritten_image'].includes(item.material_type))).map(item => { const Icon = getMaterialIcon(item.material_type); return <button key={item.id} onClick={() => { openInPane(item, filePickerPane); setFilePickerPane(null); }} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:border-[#B46A72]"><Icon size={18} className="text-[#B46A72]"/><span className="flex-1 truncate text-sm font-medium">{item.title}</span><span className="text-xs opacity-55">{getMaterialLabel(item.material_type)}</span></button>; })}{pickerTopicId && !pickerMaterials.length && <p className="rounded-lg border border-dashed p-4 text-center text-sm opacity-60">No files in this index yet.</p>}{!pickerTopicId && <p className="rounded-lg border border-dashed p-4 text-center text-sm opacity-60">Select a subject and index first.</p>}</div></div>
          </div>
        </div>}
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm" onChange={event => { uploadIntoPane(event.target.files); event.target.value = ''; }} />
      </div>
    );
  }

  // ── Topics / Chapters View (with Serial Number Index) ─────────────────────
  if (activeSubject) {
    const SubjectIcon = getIconComponent(activeSubject.icon);

    return (
      <div
        className={`min-h-screen p-8 ${
          isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
        }`}
      >
        {/* Back + subject header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveSubject(null);
                setTopics([]);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#3B1319] text-[#C6B39A]' : 'hover:bg-[#F7C8D3]/30 text-[#B46A72]'
              }`}
            >
              <ArrowLeft size={18} />
            </button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: activeSubject.color || '#B46A72' }}
            >
              <SubjectIcon size={20} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{activeSubject.name}</h1>
              <p className="text-sm opacity-60">{topics.length} indexed chapters / topics</p>
            </div>
          </div>

          <button
            onClick={() => {
              setNewTopicTitle('');
              setShowNewTopicModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
          >
            <Plus size={16} />
            Add Index Topic
          </button>
        </div>

        {/* Inline Add Topic Card (Always available right on the subject page) */}
        <div
          className={`mb-6 p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#3B1319]/80 border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B46A72]/20 text-[#B46A72] flex items-center justify-center shrink-0 font-bold text-sm">
              #{topics.length + 1}
            </div>
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Type new index topic or chapter title and press Enter..."
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                isDark ? 'bg-[#280B0F] border-[#7B694E]/40 text-white placeholder:text-[#C6B39A]/40' : 'bg-[#FFF9F3] border-[#F7C8D3] text-[#2D3A47] placeholder:text-[#2D3A47]/40'
              }`}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newTopicTitle.trim() && activeSubject) {
                  e.preventDefault();
                  try {
                    const nextSerial = topics.length + 1;
                    const created = await api.createTopic(activeSubject.id, {
                      serial_number: nextSerial,
                      title: newTopicTitle.trim(),
                      status: 'todo',
                      tags: ['#chapter'],
                    });
                    setTopics((prev) => [...prev, created]);
                    setNewTopicTitle('');
                  } catch (err) {
                    console.error('Failed to create topic inline:', err);
                  }
                }
              }}
            />
            <button
              onClick={async () => {
                if (!newTopicTitle.trim() || !activeSubject) return;
                try {
                  const nextSerial = topics.length + 1;
                  const created = await api.createTopic(activeSubject.id, {
                    serial_number: nextSerial,
                    title: newTopicTitle.trim(),
                    status: 'todo',
                    tags: ['#chapter'],
                  });
                  setTopics((prev) => [...prev, created]);
                  setNewTopicTitle('');
                } catch (err) {
                  console.error('Failed to create topic inline:', err);
                }
              }}
              disabled={!newTopicTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] disabled:opacity-50 shrink-0"
            >
              Add Topic
            </button>
          </div>
        </div>

        {/* Topics Index list */}
        {topicsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-16 rounded-2xl animate-pulse ${
                  isDark ? 'bg-[#3B1319]' : 'bg-white'
                }`}
              />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 ${
              isDark
                ? 'border-[#7B694E]/40 bg-[#3B1319]/30'
                : 'border-[#F7C8D3] bg-white/50'
            }`}
          >
            <BookOpen size={48} className="opacity-40 mb-4" />
            <p className="font-semibold mb-1">No topics yet</p>
            <p className="text-sm opacity-60">Add your first indexed chapter</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {topics
              .filter((t) => !t.parent_topic_id && !t.parentTopicId)
              .map((topic) => {
                const subtopics = topics.filter(
                  (t) => t.parent_topic_id === topic.id || t.parentTopicId === topic.id
                );
                const hasSubtopics = subtopics.length > 0;
                const isExpanded = expandedTopics.has(topic.id) || true; // expanded by default for easy visibility

                return (
                  <div key={topic.id} className="space-y-2">
                    <div
                      onClick={() => openTopic(topic)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all group cursor-pointer ${
                        isDark
                          ? 'bg-[#3B1319] border-[#7B694E]/40 hover:border-[#C6B39A]/60 hover:shadow-lg'
                          : 'bg-white border-[#F7C8D3]/60 hover:border-[#B46A72]/40 hover:shadow-lg'
                      }`}
                    >
                      {/* Serial Number & Expand Toggle */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasSubtopics ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTopics((prev) => {
                                const next = new Set(prev);
                                if (next.has(topic.id)) next.delete(topic.id);
                                else next.add(topic.id);
                                return next;
                              });
                            }}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-70"
                            title={isExpanded ? 'Collapse subtopics' : 'Expand subtopics'}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                            isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#B46A72]'
                          }`}
                        >
                          #{topic.serial_number}
                        </div>
                      </div>

                      {/* Topic Title & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base truncate group-hover:text-[#B46A72] transition-colors">
                            {topic.title}
                          </h3>
                          {hasSubtopics && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 opacity-70">
                              {subtopics.length} {subtopics.length === 1 ? 'subtopic' : 'subtopics'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                          <span>{topic.material_count ?? 0} materials</span>
                          {topic.status && (
                            <span className="capitalize">{topic.status.replace('_', ' ')}</span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {topic.progress !== undefined && topic.progress > 0 && (
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <div
                            className={`w-20 h-1.5 rounded-full overflow-hidden ${
                              isDark ? 'bg-[#280B0F]' : 'bg-[#F7C8D3]/30'
                            }`}
                          >
                            <div
                              className="h-full bg-[#A8B58A] rounded-full"
                              style={{ width: `${topic.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold opacity-60">{topic.progress}%</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSubtopicParent(topic);
                            setNewSubtopicTitle('');
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                            isDark ? 'bg-[#7B694E] text-[#F7EFE6] hover:bg-[#8C7A5D]' : 'bg-[#B46A72] text-white hover:bg-[#A05563]'
                          }`}
                          title="Add subtopic under this index"
                        >
                          <Plus size={14} />
                          <span>Add Subtopic</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Delete index #${topic.serial_number} "${topic.title}"?`)) {
                              await api.deleteTopic(topic.id);
                              setTopics((prev) => prev.filter((t) => t.id !== topic.id && t.parent_topic_id !== topic.id && t.parentTopicId !== topic.id));
                            }
                          }}
                          className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete index topic"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <ChevronRight
                        size={16}
                        className="opacity-40 shrink-0 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>

                    {/* Render Subtopics indented underneath parent */}
                    {hasSubtopics && isExpanded && (
                      <div className="pl-10 space-y-2">
                        {subtopics.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => openTopic(sub)}
                            className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group/sub ${
                              isDark
                                ? 'bg-[#3B1319]/70 border-[#7B694E]/30 hover:border-[#C6B39A]/60'
                                : 'bg-white/90 border-[#F7C8D3]/50 hover:border-[#B46A72]/40 shadow-xs'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                isDark ? 'bg-[#7B694E]/20 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#B46A72]'
                              }`}
                            >
                              #{sub.serial_number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate group-hover/sub:text-[#B46A72] transition-colors">
                                {sub.title}
                              </h4>
                              <span className="text-[11px] opacity-60">
                                Subtopic · {sub.material_count ?? 0} materials
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete subtopic #${sub.serial_number} "${sub.title}"?`)) {
                                  await api.deleteTopic(sub.id);
                                  setTopics((prev) => prev.filter((t) => t.id !== sub.id));
                                }
                              }}
                              className="p-1.5 rounded-lg opacity-30 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete subtopic"
                            >
                              <Trash2 size={14} />
                            </button>
                            <ChevronRight size={14} className="opacity-40 shrink-0 group-hover/sub:translate-x-0.5 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Modal for adding a Subtopic */}
        {subtopicParent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
                isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg">Add Subtopic</h3>
                  <p className="text-xs opacity-60">
                    To Index #{subtopicParent.serial_number}: {subtopicParent.title}
                  </p>
                </div>
                <button
                  onClick={() => setSubtopicParent(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5"
                >
                  <X size={18} className="opacity-60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-60 mb-2">Subtopic Title</label>
                  <input
                    type="text"
                    value={newSubtopicTitle}
                    onChange={(e) => setNewSubtopicTitle(e.target.value)}
                    placeholder="e.g. 1.1 Hyperparameter Tuning & Grid Search"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-[#280B0F] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
                    }`}
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newSubtopicTitle.trim()) {
                        e.preventDefault();
                        const existingSubs = topics.filter(
                          (t) => t.parent_topic_id === subtopicParent.id || t.parentTopicId === subtopicParent.id
                        );
                        const baseSerial = Math.floor(subtopicParent.serial_number);
                        const nextSerialNum = Number((baseSerial + (existingSubs.length + 1) * 0.1).toFixed(1));
                        try {
                          const created = await api.createTopic(activeSubject.id, {
                            serial_number: nextSerialNum,
                            title: newSubtopicTitle.trim(),
                            parent_topic_id: subtopicParent.id,
                            status: 'todo',
                            tags: ['#subtopic'],
                          });
                          setTopics((prev) => [...prev, created]);
                          setExpandedTopics((prev) => new Set([...prev, subtopicParent.id]));
                          setNewSubtopicTitle('');
                          setSubtopicParent(null);
                        } catch (err) {
                          console.error('Failed to create subtopic:', err);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setSubtopicParent(null)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                    isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#2D3A47]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newSubtopicTitle.trim()) return;
                    const existingSubs = topics.filter(
                      (t) => t.parent_topic_id === subtopicParent.id || t.parentTopicId === subtopicParent.id
                    );
                    const baseSerial = Math.floor(subtopicParent.serial_number);
                    const nextSerialNum = Number((baseSerial + (existingSubs.length + 1) * 0.1).toFixed(1));
                    try {
                      const created = await api.createTopic(activeSubject.id, {
                        serial_number: nextSerialNum,
                        title: newSubtopicTitle.trim(),
                        parent_topic_id: subtopicParent.id,
                        status: 'todo',
                        tags: ['#subtopic'],
                      });
                      setTopics((prev) => [...prev, created]);
                      setExpandedTopics((prev) => new Set([...prev, subtopicParent.id]));
                      setNewSubtopicTitle('');
                      setSubtopicParent(null);
                    } catch (err) {
                      console.error('Failed to create subtopic:', err);
                    }
                  }}
                  disabled={!newSubtopicTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] disabled:opacity-55"
                >
                  Add Subtopic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Index Topic Modal inside Subject View */}
        {showNewTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
                isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">Add New Index Topic / Chapter</h3>
                <button onClick={() => setShowNewTopicModal(false)} className="p-1.5 rounded-lg hover:bg-black/5">
                  <X size={18} className="opacity-60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-60 mb-2">Topic Title</label>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="e.g. Advanced Decision Trees & Random Forests"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-[#280B0F] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
                    }`}
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newTopicTitle.trim() && activeSubject) {
                        e.preventDefault();
                        try {
                          const nextSerial = topics.length + 1;
                          const created = await api.createTopic(activeSubject.id, {
                            serial_number: nextSerial,
                            title: newTopicTitle.trim(),
                            status: 'todo',
                            tags: ['#chapter'],
                          });
                          setTopics((prev) => [...prev, created]);
                          setNewTopicTitle('');
                          setShowNewTopicModal(false);
                        } catch (err) {
                          console.error('Failed to create topic:', err);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewTopicModal(false)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                    isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#2D3A47]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newTopicTitle.trim() || !activeSubject) return;
                    try {
                      const nextSerial = topics.length + 1;
                      const created = await api.createTopic(activeSubject.id, {
                        serial_number: nextSerial,
                        title: newTopicTitle.trim(),
                        status: 'todo',
                        tags: ['#chapter'],
                      });
                      setTopics((prev) => [...prev, created]);
                      setNewTopicTitle('');
                      setShowNewTopicModal(false);
                    } catch (err) {
                      console.error('Failed to create topic:', err);
                    }
                  }}
                  disabled={!newTopicTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] disabled:opacity-50"
                >
                  Add Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Subjects List (card / table toggle) ─────────────────────
  return (
    <div
      className={`min-h-screen p-8 ${
        isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Study Notes & Subjects</h1>
          <p className="text-sm opacity-70">
            Click any subject to open its indexed chapters & materials
          </p>
        </div>
        <button
          onClick={() => setShowNewSubjectModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
        >
          <Plus size={18} />
          New Subject
        </button>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-[#C6B39A]/50' : 'text-[#2D3A47]/40'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects..."
            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
            }`}
          />
        </div>

        {/* View toggle */}
        <div
          className={`flex items-center p-1 rounded-xl ${
            isDark ? 'bg-[#3B1319]' : 'bg-[#F7C8D3]/20'
          }`}
        >
          <button
            onClick={() => setViewMode('cards')}
            title="Card view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#B46A72] text-white'
                : isDark
                ? 'text-[#C6B39A] hover:bg-[#7B694E]/30'
                : 'text-[#2D3A47] hover:bg-[#F7C8D3]/40'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            title="Table view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-[#B46A72] text-white'
                : isDark
                ? 'text-[#C6B39A] hover:bg-[#7B694E]/30'
                : 'text-[#2D3A47] hover:bg-[#F7C8D3]/40'
            }`}
          >
            <Table2 size={16} />
          </button>
        </div>
      </div>

      {/* Subjects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-40 rounded-2xl animate-pulse ${
                isDark ? 'bg-[#3B1319]' : 'bg-white'
              }`}
            />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 ${
            isDark
              ? 'border-[#7B694E]/40 bg-[#3B1319]/30'
              : 'border-[#F7C8D3] bg-white/50'
          }`}
        >
          <BookOpen size={48} className="opacity-40 mb-4" />
          <p className="font-semibold mb-1">No subjects found</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isDark={isDark}
              onClick={() => openSubject(subject)}
              onIconClick={() => setIconPickerSubject(subject.id)}
            />
          ))}
        </div>
      ) : (
        <SubjectTable
          subjects={filteredSubjects}
          isDark={isDark}
          onOpen={openSubject}
          onIconClick={(id) => setIconPickerSubject(id)}
        />
      )}

      {/* New Subject Modal */}
      {showNewSubjectModal && (
        <NewSubjectModal
          isDark={isDark}
          palette={SUBJECT_PALETTE}
          onClose={() => setShowNewSubjectModal(false)}
          onCreated={(newSub) => {
            setSubjects([...subjects, newSub]);
            setShowNewSubjectModal(false);
          }}
        />
      )}

      {/* New Index Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Add New Index Topic / Chapter</h3>
              <button onClick={() => setShowNewTopicModal(false)} className="p-1.5 rounded-lg hover:bg-black/5">
                <X size={18} className="opacity-60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase opacity-60 mb-2">Topic Title</label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Advanced Decision Trees & Random Forests"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-[#280B0F] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
                  }`}
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTopicModal(false)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                  isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#2D3A47]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTopicTitle.trim() || !activeSubject) return;
                  try {
                    const nextSerial = topics.length + 1;
                    const created = await api.createTopic(activeSubject.id, {
                      serial_number: nextSerial,
                      title: newTopicTitle.trim(),
                      status: 'todo',
                      tags: ['#chapter'],
                    });
                    setTopics((prev) => [...prev, created]);
                    setNewTopicTitle('');
                    setShowNewTopicModal(false);
                  } catch (err) {
                    console.error('Failed to create topic:', err);
                  }
                }}
                disabled={!newTopicTitle.trim()}
                className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] disabled:opacity-50"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {iconPickerSubject && (
        <IconPickerModal
          isDark={isDark}
          currentIcon={subjects.find((s) => s.id === iconPickerSubject)?.icon}
          onSelect={(icon) => handleIconChange(iconPickerSubject, icon)}
          onClose={() => setIconPickerSubject(null)}
        />
      )}
    </div>
  );
}

// ── SubjectCard ──────────────────────────────────────────

function SubjectCard({ subject, isDark, onClick, onIconClick }) {
  const Icon = getIconComponent(subject.icon);

  return (
    <div
      className={`group relative p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40 hover:border-[#C6B39A]/60'
          : 'bg-white border-[#F7C8D3]/60 hover:border-[#B46A72]/40'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIconClick();
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 hover:ring-2 hover:ring-white/30 transition-all"
          style={{ backgroundColor: subject.color || '#B46A72' }}
          title="Change icon"
        >
          <Icon size={20} />
        </button>
        <h3 className="font-display text-xl font-bold flex-1 truncate">
          {subject.name}
        </h3>
      </div>
      <p className="text-sm opacity-70 mb-4">
        {subject.topic_count ?? 0} topics · {subject.recent_topic ? `Latest: ${subject.recent_topic}` : 'No updates'}
      </p>
      <div className="flex items-center justify-between text-xs font-semibold opacity-60">
        <span>
          {subject.updated_at
            ? new Date(subject.updated_at).toLocaleDateString()
            : 'No updates'}
        </span>
        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </div>
  );
}

// ── SubjectTable ──────────────────────────────────────────

function SubjectTable({ subjects, isDark, onOpen, onIconClick }) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`border-b ${
              isDark ? 'border-[#7B694E]/30' : 'border-[#F7C8D3]/40'
            }`}
          >
            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide opacity-60">
              Subject
            </th>
            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide opacity-60">
              Topics
            </th>
            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide opacity-60">
              Recent
            </th>
            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide opacity-60">
              Updated
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => {
            const Icon = getIconComponent(subject.icon);
            return (
              <tr
                key={subject.id}
                onClick={() => onOpen(subject)}
                className={`border-b last:border-0 cursor-pointer transition-colors ${
                  isDark
                    ? 'border-[#7B694E]/20 hover:bg-[#7B694E]/10'
                    : 'border-[#F7C8D3]/20 hover:bg-[#F7C8D3]/10'
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIconClick(subject.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 hover:ring-2 hover:ring-white/30 transition-all"
                      style={{ backgroundColor: subject.color || '#B46A72' }}
                      title="Change icon"
                    >
                      <Icon size={16} />
                    </button>
                    <span className="font-semibold">{subject.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 opacity-80">{subject.topic_count ?? 0}</td>
                <td className="px-5 py-3.5 opacity-60 text-xs truncate max-w-[200px]">
                  {subject.recent_topic || '—'}
                </td>
                <td className="px-5 py-3.5 opacity-60 text-xs">
                  {subject.updated_at
                    ? new Date(subject.updated_at).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-3 py-3.5">
                  <ChevronRight size={16} className="opacity-40" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── NewSubjectModal ──────────────────────────────────────────

function NewSubjectModal({ isDark, palette, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(Object.values(palette)[0]);
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const newSub = await api.createSubject({
      name: name.trim(),
      color: selectedColor,
    });
    // also update icon if custom
    if (selectedIcon !== 'BookOpen') {
      await api.updateSubject(newSub.id, { icon: selectedIcon });
      newSub.icon = selectedIcon;
    }
    onCreated(newSub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
          isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Create New Subject</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5">
            <X size={18} className="opacity-60" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase opacity-60 mb-2">Subject Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Artificial Intelligence"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                isDark ? 'bg-[#280B0F] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase opacity-60 mb-2">Color Preset</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(palette).map(([key, hex]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedColor(hex)}
                  className={`h-9 rounded-xl transition-all ${
                    selectedColor === hex ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={key}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase opacity-60 mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {ICON_OPTIONS.map((iconName) => {
                const Icon = getIconComponent(iconName);
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#B46A72] text-white'
                        : isDark
                        ? 'hover:bg-[#7B694E]/30 text-[#C6B39A]'
                        : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                    }`}
                  >
                    <Icon size={18} className="mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] disabled:opacity-50"
          >
            Create Subject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── IconPickerModal ──────────────────────────────────────────

function IconPickerModal({ isDark, currentIcon, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        className={`relative z-10 w-80 p-5 rounded-2xl shadow-2xl border ${
          isDark
            ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]'
            : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Choose Icon</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={16} className="opacity-60" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map((name) => {
            const Icon = getIconComponent(name);
            const isSelected = currentIcon === name;
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                title={name}
                className={`p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#B46A72] text-white ring-2 ring-[#B46A72]/30'
                    : isDark
                    ? 'hover:bg-[#7B694E]/30 text-[#C6B39A]'
                    : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                }`}
              >
                <Icon size={20} className="mx-auto" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}



