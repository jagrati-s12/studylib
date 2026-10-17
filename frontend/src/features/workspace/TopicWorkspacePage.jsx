import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbSeparator,
} from 'lucide-react';

import { api } from '@/lib/api';
import WorkspaceToolbar from './WorkspaceToolbar';
import WorkspaceLayout from './WorkspaceLayout';
import MaterialPane from './MaterialPane';
import { Folder as FolderIcon, FolderPlus, Plus, FileText, Upload, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { useTheme } from '@/context/ThemeContext';
import { saveStudyFile } from '@/lib/file-storage';

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
  const [showWorkspace, setShowWorkspace] = useState(false);
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
          foldersList, note,
          wsSettings,
        ]) => {
          if (!isMounted) return;
          setSubject(sub ?? null);
          setTopic(top ?? null);
          setAllTopics(topicsList.sort((a, b) => a.serial_number - b.serial_number));
          setMaterials(mats);
          setFolders(foldersList);
          setDigitalNote(note);

          // Always force folder view (`showWorkspace = false`) first when opening any topic index
          setLayout('single');
          setShowWorkspace(false);
          setPanelIds(['digital-notes', null, null, null]);
          setLoading(false);
        },
      )
      .catch(err => {
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
      api.saveWorkspaceSettings(topicId, { layout: newLayout, panels: panelIds.map(item_id => ({ item_id, page: 1, zoom: 100 })) });
    }
  };

  const handleLeftChange = (id) => {
    setLeftMaterialId(id);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { left_material_id: id });
    }
  };

  const handleRightChange = (id) => {
    setRightMaterialId(id);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { right_material_id: id });
    }
  };

  const handlePanelChange = (index, id) => {
    setPanelIds(previous => {
      const next = [...previous]; next[index] = id;
      if (topicId) api.saveWorkspaceSettings(topicId, { panels: next.map(item_id => ({ item_id, page: 1, zoom: 100 })), left_material_id: next[0], right_material_id: next[1] });
      return next;
    });
  };

const handleUpload = async (files) => {
  if (!topicId || !files?.length) return;

  try {
    const uploadedList = await Promise.all(
      files.map(async (file) => {
        // Save the actual file in IndexedDB.
        const fileKey = await saveStudyFile(file);

        // Store its persistent key in the existing material record.
        return api.uploadMaterial(topicId, {
          name: file.name,
          size: file.size,
          type: file.type,
          url: `idb:${fileKey}`,
          folderId: currentFolderId,
        });
      })
    );

    setMaterials((previous) => [...previous, ...uploadedList]);

    const firstUploaded = uploadedList[0];

    if (firstUploaded) {
      // Open the workspace and display the first newly uploaded file.
      setShowWorkspace(true);

      setPanelIds((previous) => {
        const next = [...previous];

        const visibleCount = {
          single: 1,
          split: 2,
          triple: 3,
          quad: 4,
        }[layout] || 1;

        const emptyIndex = next
          .slice(0, visibleCount)
          .findIndex((id) => !id);

        const targetIndex =
          layout === 'single'
            ? 0
            : emptyIndex >= 0
              ? emptyIndex
              : 0;

        next[targetIndex] = firstUploaded.id;

        api.saveWorkspaceSettings(topicId, {
          layout,
          panels: next.map((item_id) => ({
            item_id,
            page: 1,
            zoom: 100,
          })),
          left_material_id: next[0],
          right_material_id: next[1],
        });

        return next;
      });
    }
  } catch (error) {
    console.error('Failed to upload material:', error);

    window.alert(
      error instanceof Error
        ? error.message
        : 'The file could not be saved. Please try again.'
    );
  }
};
  const createFolder = async () => {
    if (!topicId) return;
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    try { const folder = await api.createFolder(topicId, name, currentFolderId); setFolders(previous => [...previous, folder]); } catch (error) { window.alert(error instanceof Error ? error.message : 'Could not create folder'); }
  };

  // Previous and next topic navigation
  const currentIndex = allTopics.findIndex(t => t.id === topicId);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < allTopics.length - 1
      ? allTopics[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-surface-400 text-sm">
          Loading workspace…
        </div>
      </div>
    );
  }

  if (!topic || !subject) {
    return (
      <div className="p-8 text-center">
        <p className="text-surface-600 mb-4">Topic not found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary-600 hover:underline text-sm font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-white text-[#2D3A47]'}`}>
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className={`flex items-center justify-between px-6 py-2.5 border-b text-sm ${isDark ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A]' : 'bg-surface-50 border-surface-200 text-surface-600'}`}>
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-surface-600 min-w-0">
          <Link
            to="/dashboard"
            className="hover:text-primary-600 transition-colors"
          >
            Dashboard
          </Link>
          <BreadcrumbSeparator size={14} className="text-surface-400" />
          <Link
            to={`/subjects/${subject.id}`}
            className="hover:text-primary-600 transition-colors truncate max-w-[150px]"
          >
            {subject.name}
          </Link>
          <BreadcrumbSeparator size={14} className="text-surface-400" />
          <span className="font-semibold text-surface-900 truncate">
            #{topic.serial_number} {topic.title}
          </span>
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

      {!showWorkspace ? <div className={`flex-1 overflow-auto p-6 transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-surface-50 text-[#2D3A47]'}`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold">{topic.title}</h1><p className={`text-sm ${isDark ? 'text-[#C6B39A]/70' : 'text-surface-500'}`}>{currentFolderId ? 'Folder contents' : 'Index library'} · {materials.filter(material => material.folder_id === currentFolderId).length} items</p></div><div className="flex gap-2"><button onClick={createFolder} className={`rounded-lg border px-3 py-2 text-sm transition-colors ${isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'} `}><FolderPlus size={16} className="mr-1 inline"/>New folder</button><button onClick={()=>setShowUpload(true)} className={`rounded-lg border px-3 py-2 text-sm transition-colors ${isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'}`}><Upload size={16} className="mr-1 inline"/>Add material</button></div></div>
          {currentFolderId && <button onClick={()=>setCurrentFolderId(null)} className={`mb-4 text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${isDark ? 'border-[#3B1319] bg-[#280B0F] hover:bg-[#3B1319] text-[#C6B39A]' : 'border-surface-200 bg-white hover:bg-surface-50 text-surface-700'}`}>← Back to folder view</button>}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {folders.filter(folder => folder.parent_folder_id === currentFolderId).map(folder => {
              const count = materials.filter(item => item.folder_id === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`group relative rounded-2xl border p-5 text-left transition-all shadow-sm hover:shadow-md ${
                    isDark
                      ? 'bg-[#3B1319]/80 border-[#7B694E]/40 hover:border-primary-400 text-[#F7EFE6]'
                      : 'bg-white border-surface-200 hover:border-primary-400 text-surface-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subject.color || '#B46A72' }}
                    >
                      <FolderIcon size={24} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 dark:bg-black/30 text-surface-600 dark:text-surface-300">
                      {count} items
                    </span>
                  </div>
                  <div className="font-display font-bold text-base truncate mb-1">{folder.name}</div>
                  <div className="text-xs opacity-60">Click to browse folder</div>
                </button>
              );
            })}

            {/* If at root view, also show default category shortcuts (PPT, PDF, Notes, Handwritten, Other) styled with subject color */}
            {!currentFolderId && ['PDFs', 'PPTs', 'Digital Notes', 'Handwritten Notes', 'Others'].map((category, idx) => {
              const catCount = category === 'PDFs' ? materials.filter(m => m.material_type === 'pdf').length
                : category === 'PPTs' ? materials.filter(m => m.material_type === 'ppt').length
                : category === 'Digital Notes' ? 1
                : category === 'Handwritten Notes' ? materials.filter(m => m.material_type === 'handwritten_image').length
                : materials.filter(m => !['pdf', 'ppt', 'handwritten_image'].includes(m.material_type)).length;

              return (
                <button
                  key={category}
                  onClick={() => {
                    if (category === 'Digital Notes') {
                      setLayout('single');
                      setPanelIds(previous => ['digital-notes', ...previous.slice(1)]);
                      setShowWorkspace(true);
                    } else {
                      const matchedFolder = folders.find(f => f.name.toLowerCase() === category.toLowerCase());
                      if (matchedFolder) setCurrentFolderId(matchedFolder.id);
                    }
                  }}
                  className={`group relative rounded-2xl border p-5 text-left transition-all shadow-sm hover:shadow-md ${
                    isDark
                      ? 'bg-[#3B1319]/80 border-[#7B694E]/40 hover:border-primary-400 text-[#F7EFE6]'
                      : 'bg-white border-surface-200 hover:border-primary-400 text-surface-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subject.color || '#B46A72' }}
                    >
                      <FolderIcon size={24} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 dark:bg-black/30 text-surface-600 dark:text-surface-300">
                      {catCount} items
                    </span>
                  </div>
                  <div className="font-display font-bold text-base truncate mb-1">{category}</div>
                  <div className="text-xs opacity-60">Category folder</div>
                </button>
              );
            })}

            {materials.filter(material => material.folder_id === currentFolderId).map(material => {
              const MatIcon = getMaterialIcon(material.material_type);
              return (
                <button
                  key={material.id}
                  onClick={() => {
                    setLayout('single');
                    setPanelIds(previous => [material.id, ...previous.slice(1)]);
                    setShowWorkspace(true);
                  }}
                  className={`group relative rounded-2xl border p-5 text-left transition-all shadow-sm hover:shadow-md ${
                    isDark
                      ? 'bg-[#3B1319]/80 border-[#7B694E]/40 hover:border-primary-400 text-[#F7EFE6]'
                      : 'bg-white border-surface-200 hover:border-primary-400 text-surface-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subject.color || '#B46A72' }}
                    >
                      <MatIcon size={24} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 dark:bg-black/30 text-surface-600 dark:text-surface-300">
                      {getMaterialLabel(material.material_type)}
                    </span>
                  </div>
                  <div className="font-display font-bold text-base truncate mb-1">{material.title}</div>
                  <div className="text-xs opacity-60">{formatFileSize(material.file_size_bytes)}</div>
                </button>
              );
            })}

            <button
              onClick={createFolder}
              className={`group relative rounded-2xl border border-dashed p-5 text-left transition-all shadow-sm hover:shadow-md ${
                isDark
                  ? 'bg-[#3B1319]/40 border-[#7B694E]/60 hover:border-primary-400 text-[#C6B39A]'
                  : 'bg-surface-50 border-surface-300 hover:border-primary-400 text-surface-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm opacity-80"
                  style={{ backgroundColor: subject.color || '#B46A72' }}
                >
                  <FolderPlus size={24} />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-200/50 dark:bg-black/20">
                  Custom
                </span>
              </div>
              <div className="font-display font-bold text-base truncate mb-1">Create new folder</div>
              <div className="text-xs opacity-60">Add custom folder for this index</div>
            </button>
          </div>
        </div>{showUpload && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${isDark ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A]' : 'bg-white border-surface-200 text-surface-950'}`}><button type="button" className="float-right" onClick={()=>setShowUpload(false)} aria-label="Close upload"><X size={18}/></button><h2 className="mb-1 text-lg font-semibold">Add material</h2><p className={`mb-4 text-sm ${isDark ? 'text-[#C6B39A]/70' : 'text-surface-500'}`}>It will be saved in the folder you are currently viewing.</p><FileUpload accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm" onFilesSelected={files=>{handleUpload(files);setShowUpload(false)}}/></div></div>}</div> : <>
      {/* Workspace Action Toolbar */}
      <WorkspaceToolbar
        layout={layout}
        onLayoutChange={handleLayoutChange}
        materials={materials}
        panelIds={panelIds.map(id => id ?? '')}
        onPanelChange={handlePanelChange}
        saveStatus={saveStatus}
        onUpload={handleUpload}
      />

      {/* Study Panels (Single or Resizable Split) */}
      <div className="flex-1 min-h-0">
        <WorkspaceLayout
          layout={layout}
          contents={panelIds.map((id, index) => <MaterialPane key={`${index}-${id ?? 'empty'}`} materialId={id} materials={materials} digitalNote={digitalNote} onNoteChange={handleNoteChange} />)}
        />
      </div>
      </>}
    </div>
  );
}
export default TopicWorkspacePage;


