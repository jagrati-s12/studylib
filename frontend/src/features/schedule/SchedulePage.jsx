import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Clock,
  Users,
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const INITIAL_EVENTS = [
  {
    id: '1',
    title: 'UX Huddle Call',
    start: '2026-06-18T09:00:00',
    end: '2026-06-18T09:30:00',
    color: '#768E78', // Fern
    attendees: 2,
    day: 'Wednesday',
  },
  {
    id: '2',
    title: 'Analytics Kickoff – Formix Insights',
    start: '2026-06-19T09:00:00',
    end: '2026-06-19T10:00:00',
    color: '#FECDBE', // Cherry Blossom
    attendees: 3,
    day: 'Thursday',
  },
  {
    id: '3',
    title: 'Standup Meeting – NovaBoard Team',
    start: '2026-06-16T09:45:00',
    end: '2026-06-16T10:45:00',
    color: '#B7CBDB', // Bluebell
    attendees: 5,
    day: 'Monday',
  },
  {
    id: '4',
    title: 'Frontend Dev Sync – API Mapping Task',
    start: '2026-06-17T10:00:00',
    end: '2026-06-17T11:45:00',
    color: '#FCC88A', // Honey
    attendees: 4,
    day: 'Tuesday',
  },
  {
    id: '5',
    title: 'Design Sync – Website Revamp',
    start: '2026-06-18T10:00:00',
    end: '2026-06-18T10:45:00',
    color: '#E79897', // Peony
    attendees: 3,
    day: 'Wednesday',
  },
];

const GOOGLE_CALENDAR_SAMPLE_EVENTS = [
  {
    id: 'g-1',
    title: 'Google Calendar: Machine Learning Lecture',
    start: '2026-06-16T11:00:00',
    end: '2026-06-16T12:30:00',
    color: '#4285F4',
    attendees: 45,
    day: 'Monday',
    isGoogle: true,
  },
  {
    id: 'g-2',
    title: 'Google Calendar: Study Group - React App',
    start: '2026-06-17T13:00:00',
    end: '2026-06-17T14:30:00',
    color: '#4285F4',
    attendees: 4,
    day: 'Tuesday',
    isGoogle: true,
  },
  {
    id: 'g-3',
    title: 'Google Calendar: Project Milestone Review',
    start: '2026-06-18T14:00:00',
    end: '2026-06-18T15:00:00',
    color: '#4285F4',
    attendees: 8,
    day: 'Wednesday',
    isGoogle: true,
  },
];

export default function SchedulePage() {
  const { isDark } = useTheme();
  const [view, setView] = useState('weekly');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 18)); // June 18, 2026

  const [filters, setFilters] = useState({
    meetings: true,
    taskDueDates: true,
    milestones: true,
    deadlines: true,
    googleCalendar: true,
  });

  const handleSyncGoogleCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsGoogleSynced(!isGoogleSynced);
      if (!isGoogleSynced) {
        setEvents((prev) => [...GOOGLE_CALENDAR_SAMPLE_EVENTS, ...prev]);
      } else {
        setEvents((prev) => prev.filter((ev) => !ev.isGoogle));
      }
    }, 1200);
  };

  // Helper date calculations
  const getWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(start);
    monday.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const dates = [];

    // Previous month filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevLastDay - i));
    }

    // Current month
    for (let i = 1; i <= lastDay; i++) {
      dates.push(new Date(year, month, i));
    }

    // Next month filler to complete grid (42 cells)
    const remainingCells = 42 - dates.length;
    for (let i = 1; i <= remainingCells; i++) {
      dates.push(new Date(year, month + 1, i));
    }

    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 5, 18));
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMonthDisplay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (ev.isGoogle && !filters.googleCalendar) return false;
      return true;
    });
  }, [events, searchQuery, filters]);

  const getEventsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return filteredEvents.filter((ev) => ev.start.startsWith(dateKey));
  };

  const getEventsForSlot = (date, hourIndex) => {
    const dateKey = formatDateKey(date);
    return filteredEvents.filter((ev) => {
      if (!ev.start.startsWith(dateKey)) return false;
      const evHour = parseInt(ev.start.split('T')[1].split(':')[0], 10);
      const slotHour = 8 + hourIndex;
      return evHour === slotHour;
    });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl mb-8 border relative overflow-hidden flex items-center justify-between ${
          isDark
            ? 'bg-gradient-to-r from-[#3B1319] via-[#4A1A22] to-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]'
            : 'bg-gradient-to-r from-[#FFF6F8] via-[#FFF0F3] to-[#FFF6F8] border-[#F7C8D3]/60 text-[#2D3A47]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/40 text-[#B46A72]'
              }`}
            >
              Calendar & Schedule
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-1">Time & Schedule Hub</h1>
          <p className="text-sm opacity-70">
            Manage your academic lectures, project milestones, team calls, and Google Calendar sync seamlessly.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div
            className={`px-4 py-3 rounded-2xl border text-center ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="text-2xl font-bold font-display text-[#B46A72]">
              {events.length}
            </div>
            <div className="text-xs opacity-60">Scheduled Events</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Google Calendar Sync Widget */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-sm">Google Calendar</h4>
                  <p className="text-[11px] opacity-60">
                    {isGoogleSynced ? 'Synced & Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {isGoogleSynced && (
                <CheckCircle size={18} className="text-emerald-500" />
              )}
            </div>

            <button
              type="button"
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncing}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                isGoogleSynced
                  ? isDark
                    ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-red-100 hover:text-red-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Connecting to Google...
                </>
              ) : isGoogleSynced ? (
                'Disconnect Google Calendar'
              ) : (
                <>
                  <ExternalLink size={14} />
                  Connect Google Calendar
                </>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-[#C6B39A]/50' : 'text-[#2D3A47]/40'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          {/* Mini Calendar */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base">
                {formatMonthDisplay(currentDate)}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-semibold opacity-60">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {monthDates.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = formatDateKey(date) === formatDateKey(new Date());
                const isSelected = formatDateKey(date) === formatDateKey(currentDate);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentDate(new Date(date))}
                    className={`h-8 rounded-lg transition-colors font-semibold ${
                      isToday
                        ? 'bg-[#A8B58A] text-white'
                        : isSelected
                        ? isDark
                          ? 'bg-[#B46A72] text-white'
                          : 'bg-[#B46A72] text-white'
                        : isCurrentMonth
                        ? isDark
                          ? 'hover:bg-[#7B694E]/30'
                          : 'hover:bg-[#F7C8D3]/30'
                        : isDark
                        ? 'text-[#C6B39A]/40'
                        : 'text-[#2D3A47]/30'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <h4 className="font-bold text-sm mb-3">Filters</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(filters).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded accent-[#A8B58A]"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="flex-1">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={view === 'daily' ? goToPreviousDay : view === 'weekly' ? goToPreviousWeek : goToPreviousMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3B1319]' : 'hover:bg-[#F7C8D3]/30'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {view === 'daily'
                    ? formatDateDisplay(currentDate)
                    : view === 'weekly'
                    ? `${formatDateDisplay(weekDates[0])} - ${formatDateDisplay(weekDates[6])}`
                    : formatMonthDisplay(currentDate)
                  }
                </h2>
              </div>
              <button
                type="button"
                onClick={view === 'daily' ? goToNextDay : view === 'weekly' ? goToNextWeek : goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3B1319]' : 'hover:bg-[#F7C8D3]/30'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDark
                    ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#7B694E]/30'
                    : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
                }`}
              >
                Today
              </button>

              {/* View Toggle */}
              <div
                className={`inline-flex rounded-xl p-1 ${
                  isDark ? 'bg-[#3B1319]' : 'bg-[#F7C8D3]/30'
                }`}
              >
                {['daily', 'weekly', 'monthly'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                      view === v
                        ? 'bg-[#B46A72] text-white shadow-sm'
                        : isDark
                        ? 'text-[#C6B39A] hover:text-[#F7EFE6]'
                        : 'text-[#2D3A47] hover:text-[#B46A72]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
              >
                <Plus size={16} />
                Create Event
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          {view === 'daily' ? (
            <DailyView isDark={isDark} currentDate={currentDate} getEventsForDate={getEventsForDate} />
          ) : view === 'weekly' ? (
            <WeeklyView isDark={isDark} weekDates={weekDates} getEventsForSlot={getEventsForSlot} timeSlots={timeSlots} />
          ) : (
            <MonthlyView isDark={isDark} monthDates={monthDates} currentDate={currentDate} getEventsForDate={getEventsForDate} />
          )}
        </main>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <EventModal
          isDark={isDark}
          onClose={() => setShowEventModal(false)}
          onSave={(newEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            setShowEventModal(false);
          }}
        />
      )}
    </div>
  );
}

function DailyView({ isDark, currentDate, getEventsForDate }) {
  const events = getEventsForDate(currentDate);

  return (
    <div
      className={`p-6 rounded-3xl border min-h-[500px] ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      <h3 className="font-display font-bold text-xl mb-6">
        Events for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <CalendarIcon size={48} className="mb-3 stroke-1" />
          <p className="font-semibold">No events scheduled for this day</p>
          <p className="text-xs">Click 'Create Event' to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#4A1A22] border-[#7B694E]/30' : 'bg-[#FFF6F8] border-[#F7C8D3]/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: ev.color }}
                />
                <div>
                  <h4 className="font-bold text-base">{ev.title}</h4>
                  <div className="flex items-center gap-3 text-xs opacity-70 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {ev.start.split('T')[1].slice(0, 5)} - {ev.end.split('T')[1].slice(0, 5)}
                    </span>
                    {ev.attendees && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {ev.attendees} attendees
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyView({ isDark, weekDates, getEventsForSlot, timeSlots }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      {/* Days Header */}
      <div className="grid grid-cols-8 border-b border-inherit">
        <div className={`p-4 text-xs font-semibold opacity-50 text-center border-r border-inherit`}>
          Time
        </div>
        {weekDates.map((date, i) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              className={`p-4 text-center border-r border-inherit last:border-r-0 ${
                isToday ? (isDark ? 'bg-[#7B694E]/20' : 'bg-[#F7C8D3]/20') : ''
              }`}
            >
              <div className="text-xs opacity-60 font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold font-display ${isToday ? 'text-[#B46A72]' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slots Grid */}
      <div className="divide-y divide-inherit">
        {timeSlots.map((slot, hourIndex) => (
          <div key={slot} className="grid grid-cols-8 min-h-[90px]">
            <div className={`p-3 text-xs font-semibold opacity-50 text-center border-r border-inherit flex items-start justify-center pt-2`}>
              {slot}
            </div>
            {weekDates.map((date, dayIndex) => {
              const slotEvents = getEventsForSlot(date, hourIndex);
              return (
                <div
                  key={dayIndex}
                  className={`p-2 border-r border-inherit last:border-r-0 relative group hover:bg-black/5 transition-colors`}
                >
                  {slotEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-xl text-white text-xs font-semibold shadow-sm mb-1 truncate"
                      style={{ backgroundColor: ev.color }}
                      title={ev.title}
                    >
                      <div className="font-bold truncate">{ev.title}</div>
                      <div className="text-[10px] opacity-90">
                        {ev.start.split('T')[1].slice(0, 5)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyView({ isDark, monthDates, currentDate, getEventsForDate }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      <div className="grid grid-cols-7 border-b border-inherit text-center text-xs font-semibold py-3 opacity-65">
        <div>Sunday</div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
        <div>Saturday</div>
      </div>

      <div className="grid grid-cols-7 grid-rows-6 h-[700px]">
        {monthDates.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={idx}
              className={`p-2 border-b border-r border-inherit flex flex-col overflow-hidden ${
                isCurrentMonth ? '' : isDark ? 'bg-black/20 opacity-40' : 'bg-gray-50/50 opacity-40'
              }`}
            >
              <div className="text-xs font-bold mb-1 flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    formatDateKey(date) === formatDateKey(new Date())
                      ? 'bg-[#A8B58A] text-white'
                      : ''
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="text-[10px] px-1.5 py-1 rounded text-white font-medium truncate"
                    style={{ backgroundColor: ev.color }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventModal({ isDark, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-06-18');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [color, setColor] = useState('#B46A72');
  const [attendees, setAttendees] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent = {
      id: 'evt-' + Date.now(),
      title,
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      color,
      attendees: Number(attendees),
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
    };

    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
          isDark ? 'bg-[#3B1319] border-[#7B694E]/50 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/80 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl">Create New Event</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Group Review Session"
              required
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Color Tag</label>
              <div className="flex items-center gap-3 pt-1">
                {['#B46A72', '#768E78', '#A8B58A', '#FCC88A', '#B7CBDB', '#E79897'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Attendees Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'bg-[#4A1A22] text-[#C6B39A] hover:bg-[#7B694E]/30' : 'bg-gray-100 text-[#2D3A47] hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
