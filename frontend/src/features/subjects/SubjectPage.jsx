import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Upload,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { IndexTable } from '@/components/IndexTable';


export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSerial, setNewSerial] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [indexAction, setIndexAction] = useState<'new' | 'sub'>('new');
  const [parentTopicId, setParentTopicId] = useState('');
  const [importNotice, setImportNotice] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    Promise.all([api.getSubject(subjectId), api.getTopics(subjectId)]).then(
      ([sub, tops]) => {
        setSubject(sub ?? null);
        setTopics(tops);
        setLoading(false);
      }
    );
  }, [subjectId]);

  async function handleAddTopic() {
    if (!subjectId || !newTitle.trim()) { setFormError('A title is required.'); return; }
    const serial = parseInt(newSerial, 10);
    if (isNaN(serial) || serial < 1) { setFormError('Use an index number of 1 or greater.'); return; }
    if (topics.some(topic => topic.serial_number === serial)) { setFormError('That index number already exists in this subject.'); return; }
    setCreating(true);
    try {
      const topic = await api.createTopic(subjectId, {
        serial_number: serial,
        title: newTitle.trim(),
        parent_topic_id: indexAction === 'sub' ? parentTopicId : null,
      });
      setTopics((prev) => [...prev, topic]);
      setNewSerial('');
      setNewTitle('');
      setShowAddForm(false);
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not create index.'); } finally {
      setCreating(false);
    }
  }

  async function handleDelete(topicId) {
    await api.deleteTopic(topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-surface-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-surface-100 animate-pulse" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-surface-500">Subject not found.</p>
        <Link to="/dashboard" className="mt-3 text-primary-600 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const nextSerial =
    topics.length > 0
      ? Math.max(...topics.map((t) => t.serial_number)) + 1
      : 1;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-surface-400">
        <Link to="/dashboard" className="hover:text-primary-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} />
        <span className="text-surface-700 font-medium">{subject.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImportNotice(true);
              setTimeout(() => setImportNotice(false), 3000);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
          >
            <Upload size={16} />
            Import Index
          </button>
          <button
            onClick={() => {
              setFormError(''); setShowAddForm(true);
              setIndexAction('new'); setParentTopicId('');
              setNewSerial(String(nextSerial));
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            Add Index
          </button>
        </div>
      </div>

      {/* Import notice */}
      {importNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          <Info size={16} />
          PDF index import is coming soon — add topics manually for now.
        </div>
      )}

      {/* Add topic modal: keeps the current subject route/context intact. */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="add-index-title" onMouseDown={() => !creating && setShowAddForm(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onMouseDown={event => event.stopPropagation()}>
          <h3 id="add-index-title" className="text-lg font-semibold mb-1">Manage indexes for {subject.name}</h3>
          <p className="mb-4 text-sm text-surface-500">Create a root index, or create a sub-index inside an existing index.</p>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-surface-100 p-1">
            <button type="button" onClick={() => { setIndexAction('new'); setFormError(''); }} className={`rounded-md px-3 py-2 text-sm font-medium ${indexAction === 'new' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500'}`}>New index</button>
            <button type="button" onClick={() => { setIndexAction('sub'); setFormError(''); }} className={`rounded-md px-3 py-2 text-sm font-medium ${indexAction === 'sub' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500'}`}>Add sub-index</button>
          </div>
          {indexAction === 'sub' && <label className="mb-4 block text-sm font-medium text-surface-700">Parent index<select value={parentTopicId} onChange={event => { setParentTopicId(event.target.value); setFormError(''); }} className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm"><option value="">Choose an index</option>{topics.filter(topic => !topic.parent_topic_id).map(topic => <option key={topic.id} value={topic.id}>#{topic.serial_number} — {topic.title}</option>)}</select></label>}
          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className="block text-xs font-medium text-surface-500 mb-1">
                Serial #
              </label>
              <input
                type="number"
                min={1}
                value={newSerial}
                onChange={(e) => { setNewSerial(e.target.value); setFormError(''); }}
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-surface-500 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => { setNewTitle(e.target.value); setFormError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTopic(); if (e.key === 'Escape') setShowAddForm(false); }}
                placeholder="e.g. Introduction to Data Mining"
                autoFocus
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <button
              onClick={handleAddTopic}
              disabled={!newTitle.trim() || creating || (indexAction === 'sub' && !parentTopicId)}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddForm(false)} disabled={creating}
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-500 hover:bg-surface-100 transition-colors"
            >
              Cancel
            </button>
          </div>
          {formError && <p className="mt-3 text-sm text-red-600" role="alert">{formError}</p>}
          </div>
        </div>
      )}

      {/* Index table */}
      <IndexTable
        topics={topics}
        onTopicClick={(topicId) =>
          navigate(`/subjects/${subjectId}/topics/${topicId}`)
        }
        onDeleteTopic={handleDelete}
        onAddSubtopic={(parentTopicId) => {
          setFormError('');
          setShowAddForm(true);
          setIndexAction('sub');
          setParentTopicId(parentTopicId);
          setNewSerial(String(nextSerial));
        }}
      />
    </div>
  );
}


