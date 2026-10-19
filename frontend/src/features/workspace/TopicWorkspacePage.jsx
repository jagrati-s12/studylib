import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbSeparator,
  Folder as FolderIcon,
  FolderPlus,
  Plus,
  FileText,
  Upload,
  X,
  Presentation,
  Image,
  MessageSquare,
  Video,
  File,
  Columns2,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

import { api } from '@/lib/api';
import WorkspaceToolbar from './WorkspaceToolbar';
import WorkspaceLayout from './WorkspaceLayout';
import MaterialPane from './MaterialPane';
import { FileUpload } from '@/components/FileUpload';
import { useTheme } from '@/context/ThemeContext';
import { saveStudyFile } from '@/lib/file-storage';

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
    case 'video':
      return Video;
    default:
      return File;
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
      return 'AI Notes';
    case 'video':
      return 'Video';
    default:
      return 'Document';
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TopicWorkspacePage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWorkspace, setShowWorkspace] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [digitalNote, setDigitalNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Workspace layout and material selection state
  const [layout, setLayout] = useState('single');
  const [leftMaterialId, setLeftMaterialId] = useState('digital-notes');
  const [rightMaterialId, setRightMaterialId] = useState(null);
  const [panelIds, setPanelIds] = useState(['digital-notes', null, null, null]);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Debounced auto-save timer
  const saveTimerRef = useRef(null);

  // Load all data for the workspace
  useEffect(() => {
    if (!subjectId || !topicId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getSubject(subjectId),
      api.getTopic(topicId),
      api.getTopics(subjectId),
      api.getMaterials(topicId),
      api.getFolders(topicId),
      api.getDigitalNote(topicId),
      api.getWorkspaceSettings(topicId),
    ])
      .then(
        ([
          sub,
          top,
          topicsList,
          mats,
          foldersList,
          note,
          wsSettings,
        ]) => {
          if (!isMounted) return;
          setSubject(sub ?? null);
          setTopic(top ?? null);
          setAllTopics(topicsList.sort((a, b) => a.serial_number - b.serial_number));
          setMaterials(mats || []);
          setFolders(foldersList || []);
          setDigitalNote(note);

          // Configure initial panels: if topic has materials, open the first material and digital notes side-by-side
          const firstMaterial = mats && mats.length > 0 ? mats[0] : null;
          if (firstMaterial) {
            setLayout('split');
            setPanelIds([firstMaterial.id, 'digital-notes', null, null]);
          } else {
            setLayout('single');
            setPanelIds(['digital-notes', null, null, null]);
          }

          // Open the study workspace immediately so student can read and take notes
          setShowWorkspace(true);
          setLoading(false);
        },
      )
      .catch((err) => {
        console.error('Failed to load workspace data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [subjectId, topicId]);

  // Handle digital note change with debounced save
  const handleNoteChange = useCallback(
    (content) => {
      if (!topicId) return;
      setSaveStatus('unsaved');

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaveStatus('saving');
          const saved = await api.saveDigitalNote(topicId, content);
          setDigitalNote(saved);
          setSaveStatus('saved');
        } catch {
          setSaveStatus('unsaved');
        }
      }, 1000);
    },
    [topicId],
  );

  // Handle workspace layout changes and persist
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { layout: newLayout, panels: panelIds.map((item_id) => ({ item_id, page: 1, zoom: 100 })) });
    }
  };

  const handlePanelChange = (index, id) => {
    setPanelIds((previous) => {
      const next = [...previous];
      next[index] = id;
      if (topicId) {
        api.saveWorkspaceSettings(topicId, {
          panels: next.map((item_id) => ({ item_id, page: 1, zoom: 100 })),
          left_material_id: next[0],
          right_material_id: next[1],
        });
      }
      return next;
    });
  };

  const handleUpload = async (files) => {
    if (!topicId || !files?.length) return;

    try {
      const uploadedList = await Promise.all(
        files.map(async (file) => {
          // Save file in IndexedDB
          const fileKey = await saveStudyFile(file);

          return api.uploadMaterial(topicId, {
            name: file.name,
            size: file.size,
            type: file.type,
            url: `idb:${fileKey}`,
            folderId: currentFolderId,
          });
        }),
      );

      setMaterials((previous) => [...previous, ...uploadedList]);

      const firstUploaded = uploadedList[0];
      if (firstUploaded) {
        setShowWorkspace(true);
        setPanelIds((previous) => {
          const next = [...previous];
          next[0] = firstUploaded.id;
          if (!next[1]) next[1] = 'digital-notes';
          return next;
        });
        setLayout('split');
      }
    } catch (error) {
      console.error('Failed to upload material:', error);
      window.alert(
        error instanceof Error
          ? error.message
          : 'The file could not be saved. Please try again.',
      );
    }
  };

  const createFolder = async () => {
    if (!topicId) return;
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    try {
      const folder = await api.createFolder(topicId, name, currentFolderId);
      setFolders((previous) => [...previous, folder]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not create folder');
    }
  };

  // Open a material directly into the workspace split screen
  const openMaterialInWorkspace = (materialId) => {
    setLayout('split');
    setPanelIds([materialId, 'digital-notes', null, null]);
    setShowWorkspace(true);
  };

  // Previous and next topic navigation
  const currentIndex = allTopics.findIndex((t) => t.id === topicId);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < allTopics.length - 1
      ? allTopics[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-pulse text-surface-400 text-sm flex items-center gap-2">
          <BookOpen className="w-5 h-5 animate-spin" />
          Loading workspace & index materials…
        </div>
      </div>
    );
  }

  if (!topic || !subject) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 rounded-2xl border shadow-sm">
        <p className="text-surface-600 mb-4 font-semibold">Topic not found.</p>
        <button
          onClick={() => navigate('/notes')}
          className="px-4 py-2 bg-[#B46A72] text-white rounded-xl text-sm font-medium hover:bg-[#A05563]"
        >
          Return to Notes & Subjects
        </button>
      </div>
    );
  }

  // Filter materials for files view
  const displayedMaterials = materials.filter((material) => {
    if (currentFolderId) {
      return material.folder_id === currentFolderId;
    }
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'pdf') return material.material_type === 'pdf';
    if (selectedCategory === 'ppt') return material.material_type === 'ppt';
    if (selectedCategory === 'handwritten_image') return material.material_type === 'handwritten_image';
    if (selectedCategory === 'others') {
      return !['pdf', 'ppt', 'handwritten_image'].includes(material.material_type);
    }
    return true;
  });

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-white text-[#2D3A47]'}`}>
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className={`flex items-center justify-between px-6 py-2.5 border-b text-sm ${isDark ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A]' : 'bg-surface-50 border-surface-200 text-surface-600'}`}>
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-surface-600 min-w-0">
          <Link
            to="/notes"
            className="hover:text-primary-600 transition-colors font-medium"
          >
            Notes
          </Link>
          <BreadcrumbSeparator size={14} className="text-surface-400" />
          <Link
            to={`/subjects/${subject.id}`}
            className="hover:text-primary-600 transition-colors truncate max-w-[150px] font-medium"
          >
            {subject.name}
          </Link>
          <BreadcrumbSeparator size={14} className="text-surface-400" />
          <span className="font-semibold text-surface-900 truncate">
            #{topic.serial_number} {topic.title}
          </span>
        </div>

        {/* View Mode Toggle: Workspace vs Files */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#3B1319]/80 border-[#7B694E]/30' : 'bg-[#FFF5F6] border-[#F7C8D3]'}`}>
          <button
            onClick={() => setShowWorkspace(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showWorkspace
                ? 'bg-[#B46A72] text-white shadow-xs'
                : isDark ? 'text-[#C6B39A] hover:bg-[#280B0F]' : 'text-[#2D3A47] hover:bg-white/80'
            }`}
          >
            <Columns2 size={14} />
            <span>Workspace & Notes</span>
          </button>
          <button
            onClick={() => setShowWorkspace(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showWorkspace
                ? 'bg-[#B46A72] text-white shadow-xs'
                : isDark ? 'text-[#C6B39A] hover:bg-[#280B0F]' : 'text-[#2D3A47] hover:bg-white/80'
            }`}
          >
            <FolderIcon size={14} />
            <span>Files & Folders ({materials.length})</span>
          </button>
        </div>

        {/* Prev / Next Topic Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              prevTopic &&
              navigate(`/subjects/${subjectId}/topics/${prevTopic.id}`)
            }
            disabled={!prevTopic}
            title={prevTopic ? `Previous: #${prevTopic.serial_number} ${prevTopic.title}` : 'No previous topic'}
            className="p-1 rounded text-surface-500 hover:bg-surface-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-surface-400 px-1 font-mono">
            {currentIndex + 1} / {allTopics.length}
          </span>
          <button
            onClick={() =>
              nextTopic &&
              navigate(`/subjects/${subjectId}/topics/${nextTopic.id}`)
            }
            disabled={!nextTopic}
            title={nextTopic ? `Next: #${nextTopic.serial_number} ${nextTopic.title}` : 'No next topic'}
            className="p-1 rounded text-surface-500 hover:bg-surface-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {!showWorkspace ? (
        /* Files & Folders Library View */
        <div className={`flex-1 overflow-auto p-6 transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-surface-50 text-[#2D3A47]'}`}>
          <div className="mx-auto max-w-6xl">
            {/* Folder Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display">#{topic.serial_number} {topic.title}</h1>
                <p className={`text-sm ${isDark ? 'text-[#C6B39A]/70' : 'text-surface-500'}`}>
                  {currentFolderId ? 'Folder contents' : 'Index Material Library'} · {displayedMaterials.length} files available
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWorkspace(true)}
                  className="rounded-xl bg-[#B46A72] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#A05563] transition-colors"
                >
                  <Columns2 size={16} className="mr-1.5 inline" />
                  Open in Workspace
                </button>
                <button
                  onClick={createFolder}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'
                  }`}
                >
                  <FolderPlus size={16} className="mr-1.5 inline" />
                  New folder
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'
                  }`}
                >
                  <Upload size={16} className="mr-1.5 inline" />
                  Upload file
                </button>
              </div>
            </div>

            {/* Back button if inside a subfolder */}
            {currentFolderId && (
              <button
                onClick={() => setCurrentFolderId(null)}
                className={`mb-4 text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'
                }`}
              >
                <ArrowLeft size={14} /> Back to all folders
              </button>
            )}

            {/* Category Quick Filter Cards */}
            {!currentFolderId && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
                {[
                  { id: 'all', label: 'All Files', count: materials.length, icon: FileText },
                  { id: 'pdf', label: 'PDFs', count: materials.filter((m) => m.material_type === 'pdf').length, icon: FileText },
                  { id: 'ppt', label: 'PPTs', count: materials.filter((m) => m.material_type === 'ppt').length, icon: Presentation },
                  { id: 'notes', label: 'Digital Notes', count: 1, icon: BookOpen },
                  { id: 'handwritten_image', label: 'Handwritten', count: materials.filter((m) => m.material_type === 'handwritten_image').length, icon: Image },
                  { id: 'others', label: 'Others', count: materials.filter((m) => !['pdf', 'ppt', 'handwritten_image'].includes(m.material_type)).length, icon: FolderIcon },
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.id === 'notes') {
                          setLayout('single');
                          setPanelIds(['digital-notes', null, null, null]);
                          setShowWorkspace(true);
                        } else {
                          setSelectedCategory(cat.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#B46A72] bg-[#B46A72]/15 ring-2 ring-[#B46A72]/30'
                          : isDark
                          ? 'bg-[#280B0F] border-[#3B1319] hover:border-[#7B694E]/40'
                          : 'bg-white border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <CatIcon size={20} className={isSelected ? 'text-[#B46A72]' : 'opacity-60'} />
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                          {cat.count}
                        </span>
                      </div>
                      <div className="font-bold text-sm truncate">{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom Folders Section */}
            {folders.length > 0 && !currentFolderId && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Folders</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {folders.map((folder) => {
                    const count = materials.filter((m) => m.folder_id === folder.id).length;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setCurrentFolderId(folder.id)}
                        className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
                          isDark ? 'bg-[#280B0F] border-[#3B1319] hover:border-[#B46A72]' : 'bg-white border-surface-200 hover:border-[#B46A72]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: subject.color || '#B46A72' }}
                          >
                            <FolderIcon size={20} />
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                            {count}
                          </span>
                        </div>
                        <div className="font-bold text-sm truncate mb-0.5">{folder.name}</div>
                        <div className="text-xs opacity-50">Folder</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Materials Grid */}
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
              {currentFolderId ? 'Folder Files' : selectedCategory === 'all' ? 'All Materials' : `${selectedCategory.toUpperCase()} Materials`}
            </h3>

            {displayedMaterials.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-[#3B1319] bg-[#280B0F]/50' : 'border-surface-200 bg-white/50'}`}>
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <h4 className="font-bold text-base mb-1">No files in this view yet</h4>
                <p className="text-sm opacity-60 mb-4 max-w-sm mx-auto">
                  Upload a PDF, slides, or image to study side-by-side with your notes.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-4 py-2 bg-[#B46A72] text-white rounded-xl text-xs font-bold hover:bg-[#A05563]"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => {
                      setLayout('single');
                      setPanelIds(['digital-notes', null, null, null]);
                      setShowWorkspace(true);
                    }}
                    className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-black/5"
                  >
                    Open Digital Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMaterials.map((material) => {
                  const MatIcon = getMaterialIcon(material.material_type);
                  return (
                    <div
                      key={material.id}
                      onClick={() => openMaterialInWorkspace(material.id)}
                      className={`group p-4 rounded-2xl border text-left transition-all hover:shadow-lg cursor-pointer ${
                        isDark ? 'bg-[#280B0F] border-[#3B1319] hover:border-[#B46A72]' : 'bg-white border-surface-200 hover:border-[#B46A72]'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: subject.color || '#B46A72' }}
                        >
                          <MatIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-[#B46A72] transition-colors">{material.title}</h4>
                          <span className="text-xs opacity-60">
                            {getMaterialLabel(material.material_type)} · {formatFileSize(material.file_size_bytes)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-inherit opacity-75">
                        <span className="text-[#B46A72]">Click to study in split-view</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${isDark ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A]' : 'bg-white border-surface-200 text-surface-950'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Upload Study Material</h2>
                  <button type="button" onClick={() => setShowUpload(false)} aria-label="Close upload">
                    <X size={18} />
                  </button>
                </div>
                <p className={`mb-4 text-sm ${isDark ? 'text-[#C6B39A]/70' : 'text-surface-500'}`}>
                  File will be saved to this index for study and split-screen note-taking.
                </p>
                <FileUpload
                  accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm"
                  onFilesSelected={(files) => {
                    handleUpload(files);
                    setShowUpload(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Workspace Active View (Toolbar + Panels) */
        <div className="flex flex-col flex-1 min-h-0">
          {/* Workspace Action Toolbar */}
          <WorkspaceToolbar
            layout={layout}
            onLayoutChange={handleLayoutChange}
            materials={materials}
            panelIds={panelIds.map((id) => id ?? '')}
            onPanelChange={handlePanelChange}
            saveStatus={saveStatus}
            onUpload={handleUpload}
          />

          {/* Study Panels (Single or Resizable Split) */}
          <div className="flex-1 min-h-0">
            <WorkspaceLayout
              layout={layout}
              contents={panelIds.map((id, index) => (
                <MaterialPane
                  key={`${index}-${id ?? 'empty'}`}
                  materialId={id}
                  materials={materials}
                  digitalNote={digitalNote}
                  onNoteChange={handleNoteChange}
                />
              ))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicWorkspacePage;
