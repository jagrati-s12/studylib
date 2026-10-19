import { useState } from 'react';
import { Trash2, ArrowUpDown, FileText, ChevronDown, ChevronRight, FolderOpen, Plus } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

export function IndexTable({ topics, onTopicClick, onDeleteTopic, onAddSubtopic }) {
  const [sortField, setSortField] = useState('serial_number');
  const [sortDir, setSortDir] = useState('asc');
  const [expanded, setExpanded] = useState(new Set());

  function handleSort(field) {
    if (field === sortField) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sorted = [...topics].filter(topic => !topic.parent_topic_id).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'serial_number':
        return (a.serial_number - b.serial_number) * dir;
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'updated_at':
        return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * dir;
      default:
        return 0;
    }
  });
  const childrenOf = (parentId) => topics.filter(topic => topic.parent_topic_id === parentId).sort((a, b) => a.serial_number - b.serial_number);

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-surface-400">
        <FileText className="w-12 h-12 mb-3 text-surface-300" />
        <p className="text-base font-medium text-surface-500">No topics yet</p>
        <p className="text-sm mt-1">Add a topic manually or import from a PDF index.</p>
      </div>
    );
  }

  function SortHeader({ field, label }) {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
          active ? 'text-primary-600' : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        {label}
        <ArrowUpDown className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50">
            <th className="px-4 py-3 text-left w-24">
              <SortHeader field="serial_number" label="Serial #" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader field="title" label="Title" />
            </th>
            <th className="px-4 py-3 text-center w-28">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                Materials
              </span>
            </th>
            <th className="px-4 py-3 text-left w-36">
              <SortHeader field="updated_at" label="Updated" />
            </th>
            <th className="px-4 py-3 w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {sorted.flatMap(topic => {
            const children = childrenOf(topic.id);
            const hasChildren = children.length > 0;
            const isOpen = expanded.has(topic.id);
            const row = <tr
              key={topic.id}
              onClick={() => onTopicClick(topic.id)}
              className="group cursor-pointer hover:bg-primary-50/50 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center gap-1 min-w-[3rem] px-2 h-8 rounded-lg bg-surface-100 text-sm font-semibold text-surface-700 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(previous => {
                          const next = new Set(previous);
                          if (next.has(topic.id)) next.delete(topic.id);
                          else next.add(topic.id);
                          return next;
                        });
                      }}
                      className="p-0.5 hover:bg-black/10 rounded"
                    >
                      {isOpen ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
                    </button>
                  ) : null}
                  #{topic.serial_number}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-surface-800 group-hover:text-primary-700 transition-colors">
                {topic.title}
              </td>
              <td className="px-4 py-3 text-center text-surface-500">
                {topic.material_count ?? 0}
              </td>
              <td className="px-4 py-3 text-surface-400 text-xs">
                {formatRelativeDate(topic.updated_at)}
              </td>
              <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onAddSubtopic(topic.id);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Subtopic
                </button>
                <button
                  type="button"
                  title="Delete topic"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteTopic(topic.id);
                  }}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>;
            const childRows = isOpen ? children.map(child => <tr key={child.id} onClick={() => onTopicClick(child.id)} className="cursor-pointer bg-surface-50/70 hover:bg-primary-50 transition-colors"><td className="px-4 py-2.5"><span className="ml-5 inline-flex items-center gap-1 text-xs text-surface-500"><ChevronRight size={14}/> {child.serial_number}</span></td><td className="px-4 py-2.5 font-medium text-surface-700"><span className="inline-flex items-center gap-2"><FolderOpen size={15} className="text-primary-500"/> {child.title}</span></td><td className="px-4 py-2.5 text-center text-surface-500">{child.material_count ?? 0}</td><td className="px-4 py-2.5 text-xs text-surface-400">Sub-index</td><td className="px-4 py-2.5 text-right"><button type="button" onClick={event => { event.stopPropagation(); onDeleteTopic(child.id); }} className="p-1 text-surface-400 hover:text-red-500" aria-label={`Delete ${child.title}`}><Trash2 size={14}/></button></td></tr>) : [];
            return [row, ...childRows];
          })}
        </tbody>
      </table>
    </div>
  );
}



