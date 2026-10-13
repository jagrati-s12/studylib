import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';
import { formatRelativeDate } from '@/lib/utils';
import type { Subject } from '@/types';

export default function SubjectsListPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage all your study subjects
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          New Subject
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-100 animate-pulse"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Create your first subject from the dashboard to start organizing your study materials."
          action={{
            label: 'Go to Dashboard',
            onClick: () => navigate('/dashboard'),
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="px-4 py-3 text-left font-medium text-surface-500">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-500 w-28">
                  Topics
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-500 w-36">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.id}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                  className="cursor-pointer border-b border-surface-100 last:border-b-0 hover:bg-surface-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium text-surface-800">
                        {subject.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-surface-500">
                    {subject.topic_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-surface-400">
                    {subject.updated_at
                      ? formatRelativeDate(subject.updated_at)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
