import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbSeparator,
} from 'lucide-react';
import type {
  Subject,
  Topic,
  Material,
  DigitalNote,
  WorkspaceLayoutMode,
  Folder,
} from '@/types';
import { api } from '@/lib/api';
import WorkspaceToolbar, { type SaveStatus } from './WorkspaceToolbar';
import WorkspaceLayout from './WorkspaceLayout';
import MaterialPane from './MaterialPane';
import { Folder as FolderIcon, FolderPlus, Plus, FileText, Upload, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';

export function TopicWorkspacePage() {
  const { subjectId, topicId } = useParams<{
    subjectId: string;
    topicId: string;
  }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [digitalNote, setDigitalNote] = useState<DigitalNote | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspace layout and material selection state
  const [layout, setLayout] = useState<WorkspaceLayoutMode>('single');
  const [leftMaterialId, setLeftMaterialId] = useState<string | null>('digital-notes');
  const [rightMaterialId, setRightMaterialId] = useState<string | null>(null);
  const [panelIds, setPanelIds] = useState<(string | null)[]>(['digital-notes', null, null, null]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // Debounced auto-save timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

          if (wsSettings) {
            setLayout(wsSettings.layout ?? 'single');
            setLeftMaterialId(wsSettings.left_material_id ?? 'digital-notes');
            setRightMaterialId(wsSettings.right_material_id ?? (mats.length > 0 ? mats[0].id : null));
            setPanelIds(wsSettings.panels?.map(panel => panel.item_id) ?? [wsSettings.left_material_id ?? 'digital-notes', wsSettings.right_material_id ?? (mats[0]?.id ?? null), null, null]);
          } else {
            // Default setup: if materials exist, left is first material, right is digital notes
            setLayout('single');
            if (mats.length > 0) {
              setLeftMaterialId(mats[0].id);
              setRightMaterialId('digital-notes');
            } else {
              setLeftMaterialId('digital-notes');
              setRightMaterialId(null);
            }
          }
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
    (content: Record<string, unknown>) => {
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
  const handleLayoutChange = (newLayout: WorkspaceLayoutMode) => {
    setLayout(newLayout);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { layout: newLayout, panels: panelIds.map(item_id => ({ item_id, page: 1, zoom: 100 })) });
    }
  };

  const handleLeftChange = (id: string | null) => {
    setLeftMaterialId(id);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { left_material_id: id });
    }
  };

  const handleRightChange = (id: string | null) => {
    setRightMaterialId(id);
    if (topicId) {
      api.saveWorkspaceSettings(topicId, { right_material_id: id });
    }
  };

  const handlePanelChange = (index: number, id: string | null) => {
    setPanelIds(previous => {
      const next = [...previous]; next[index] = id;
      if (topicId) api.saveWorkspaceSettings(topicId, { panels: next.map(item_id => ({ item_id, page: 1, zoom: 100 })), left_material_id: next[0], right_material_id: next[1] });
      return next;
    });
  };

  const handleUpload = async (files: File[]) => {
    if (!topicId || files.length === 0) return;
    try {
      const uploadedList = await Promise.all(
        files.map(f =>
          api.uploadMaterial(topicId, {
            name: f.name,
            size: f.size,
            type: f.type,
            url: URL.createObjectURL(f),
            folderId: currentFolderId,
          }),
        ),
      );
      setMaterials(prev => [...prev, ...uploadedList]);
      if (uploadedList.length > 0) {
        if (layout === 'split' && (rightMaterialId === null || rightMaterialId === 'digital-notes')) {
          handleRightChange(uploadedList[0].id);
        } else if (leftMaterialId === null) {
          handleLeftChange(uploadedList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to upload material:', err);
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
    <div className="flex flex-col h-full bg-white">
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-surface-200 bg-surface-50 text-sm">
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

      {!showWorkspace ? <div className="flex-1 overflow-auto p-6 bg-surface-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold">{topic.title}</h1><p className="text-sm text-surface-500">{currentFolderId ? 'Folder contents' : 'Index library'} · {materials.filter(material => material.folder_id === currentFolderId).length} items</p></div><div className="flex gap-2"><button onClick={createFolder} className="rounded-lg border px-3 py-2 text-sm"><FolderPlus size={16} className="mr-1 inline"/>New folder</button><button onClick={()=>setShowUpload(true)} className="rounded-lg border px-3 py-2 text-sm"><Upload size={16} className="mr-1 inline"/>Add material</button></div></div>
          {currentFolderId && <button onClick={()=>setCurrentFolderId(null)} className="mb-4 text-sm text-primary-600">← Back to index</button>}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{folders.filter(folder => folder.parent_folder_id === currentFolderId).map(folder => <button key={folder.id} onClick={()=>setCurrentFolderId(folder.id)} className="rounded-xl border border-surface-200 bg-white p-4 text-left hover:border-primary-300"><FolderIcon className="mb-3 text-amber-400" size={34}/><div className="truncate font-medium">{folder.name}</div><div className="text-xs text-surface-400">{materials.filter(item=>item.folder_id===folder.id).length} items</div></button>)}{materials.filter(material => material.folder_id === currentFolderId).map(material => <button key={material.id} onClick={()=>{setLayout('single');setPanelIds(previous=>[material.id,...previous.slice(1)]);setShowWorkspace(true)}} className="rounded-xl border border-surface-200 bg-white p-4 text-left hover:border-primary-300"><FileText size={30} className="mb-3 text-primary-400"/><div className="truncate font-medium">{material.title}</div><div className="text-xs text-surface-400">{material.material_type}</div></button>)}<button onClick={()=>{setLayout('single');setPanelIds(previous=>['digital-notes',...previous.slice(1)]);setShowWorkspace(true)}} className="rounded-xl border border-dashed border-surface-300 bg-white p-4 text-left hover:border-primary-300"><Plus size={30} className="mb-3 text-primary-400"/><div className="font-medium">Digital notes</div><div className="text-xs text-surface-400">Create or open notes</div></button></div>
        </div>{showUpload && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><button type="button" className="float-right" onClick={()=>setShowUpload(false)} aria-label="Close upload"><X size={18}/></button><h2 className="mb-1 text-lg font-semibold">Add material</h2><p className="mb-4 text-sm text-surface-500">It will be saved in the folder you are currently viewing.</p><FileUpload accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm" onFilesSelected={files=>{handleUpload(files);setShowUpload(false)}}/></div></div>}</div> : <>
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
