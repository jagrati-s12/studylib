import { BookOpen } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

import { useTheme } from '@/context/ThemeContext';

export function SubjectCard({ subject, onClick }) {
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col w-full rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden text-left ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40 hover:border-[#C6B39A]/60 text-[#F7EFE6]'
          : 'bg-white border-[#EFE4CD] hover:border-[#B46A72]/40 text-[#2D3A47]'
      }`}
    >
      {/* Color accent bar */}
      <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />

      <div className="flex flex-col gap-3 p-5">
        {/* Name + icon */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold group-hover:text-[#B46A72] transition-colors line-clamp-1 text-inherit">
            {subject.name}
          </h3>
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs opacity-75">
          <span className="font-semibold">
            {subject.topic_count ?? 0} {subject.topic_count === 1 ? 'topic' : 'topics'}
          </span>
          {subject.updated_at && (
            <>
              <span className="opacity-40">•</span>
              <span>{formatRelativeDate(subject.updated_at)}</span>
            </>
          )}
        </div>

        {/* Recent topic */}
        {subject.recent_topic && (
          <p className="text-xs opacity-70 truncate">
            Last opened: <span className="font-medium opacity-100">{subject.recent_topic}</span>
          </p>
        )}
      </div>
    </button>
  );
}

export default SubjectCard;


