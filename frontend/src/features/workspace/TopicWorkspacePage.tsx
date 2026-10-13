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
} from '@/types';
import { api } from '@/lib/api';
import WorkspaceToolbar, { type SaveStatus } from './WorkspaceToolbar';
import WorkspaceLayout from './WorkspaceLayout';
import MaterialPane from './MaterialPane';

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
  const [digitalNote, setDigitalNote] = useState<DigitalNote | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspace layout and material selection state
  const [layout, setLayout] = useState<WorkspaceLayoutMode>('split');
  const [leftMaterialId, setLeftMaterialId] = useState<string | null>('digital-notes');
  const [rightMaterialId, setRightMaterialId] = useState<string | null>(null);
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
      api.getDigitalNote(topicId),
      api.getWorkspaceSettings(topicId),
    ])
      .then(
        ([
          sub,
          top,
          topicsList,
          mats,
          note,
          wsSettings,
        ]) => {
          if (!isMounted) return;
          setSubject(sub ?? null);
          setTopic(top ?? null);
          setAllTopics(topicsList.sort((a, b) => a.serial_number - b.serial_number));
          setMaterials(mats);
          setDigitalNote(note);

          if (wsSettings) {
            setLayout(wsSettings.layout);
            setLeftMaterialId(wsSettings.left_material_id ?? 'digital-notes');
            setRightMaterialId(wsSettings.right_material_id ?? (mats.length > 0 ? mats[0].id : null));
          } else {
            // Default setup: if materials exist, left is first material, right is digital notes
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
      api.saveWorkspaceSettings(topicId, { layout: newLayout });
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

  const handleUpload = async (files: File[]) => {
    if (!topicId || files.length === 0) return;
    try {
      const uploadedList = await Promise.all(
        files.map(f =>
          api.uploadMaterial(topicId, {
            name: f.name,
            size: f.size,
            type: f.type,
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

      {/* Workspace Action Toolbar */}
      <WorkspaceToolbar
        layout={layout}
        onLayoutChange={handleLayoutChange}
        materials={materials}
        leftMaterialId={leftMaterialId}
        rightMaterialId={rightMaterialId}
        onLeftChange={handleLeftChange}
        onRightChange={handleRightChange}
        saveStatus={saveStatus}
        onUpload={handleUpload}
      />

      {/* Study Panels (Single or Resizable Split) */}
      <div className="flex-1 min-h-0">
        <WorkspaceLayout
          layout={layout}
          leftContent={
            <MaterialPane
              materialId={leftMaterialId}
              materials={materials}
              digitalNote={digitalNote}
              onNoteChange={handleNoteChange}
            />
          }
          rightContent={
            <MaterialPane
              materialId={rightMaterialId}
              materials={materials}
              digitalNote={digitalNote}
              onNoteChange={handleNoteChange}
            />
          }
        />
      </div>
    </div>
  );
}
export default TopicWorkspacePage;
