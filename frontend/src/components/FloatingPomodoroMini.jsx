import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, X, Maximize2, Minimize2, Timer, Flame } from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';
import { useTheme } from '@/context/ThemeContext';

export default function FloatingPomodoroMini() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    soundEnabled,
    switchMode,
    toggleTimer,
    resetTimer,
    formattedTime,
    progressPercent,
    miniDismissed,
    setMiniDismissed,
  } = usePomodoro();

  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);

  // If user is already on the /pomodoro page, or if the timer is NOT running (not started), do not show the mini player
  const isOnPomodoroPage = location.pathname === '/pomodoro';

  if (isOnPomodoroPage || !isRunning || miniDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      {isExpanded ? (
        /* Expanded Floating Card */
        <div
          className={`w-80 p-5 rounded-3xl border shadow-2xl backdrop-blur-md transition-all ${
            isDark
              ? 'bg-[#280B0F]/95 border-[#3B1319] text-[#C6B39A]'
              : 'bg-white/95 border-[#F7C8D3] text-[#2D3A47]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#B46A72] text-white">
                <Timer size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Pomodoro Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Minimize widget"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMiniDismissed(true)}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Dismiss until reset"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Switcher pills */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/5 dark:bg-black/30 mb-4 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => switchMode('pomodoro')}
              className={`py-1.5 rounded-lg transition ${
                mode === 'pomodoro' ? 'bg-[#B46A72] text-white shadow' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => switchMode('shortBreak')}
              className={`py-1.5 rounded-lg transition ${
                mode === 'shortBreak' ? 'bg-[#B46A72] text-white shadow' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Short
            </button>
            <button
              type="button"
              onClick={() => switchMode('longBreak')}
              className={`py-1.5 rounded-lg transition ${
                mode === 'longBreak' ? 'bg-[#B46A72] text-white shadow' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Long
            </button>
          </div>

          {/* Time & Progress */}
          <div className="text-center my-3">
            <div className="text-4xl font-mono font-black tracking-tight">{formattedTime}</div>
            <p className="text-[11px] opacity-70 capitalize mt-1">
              {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'} • {sessionsCompleted} done today
            </p>
          </div>

          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-black/30 my-4 overflow-hidden">
            <div
              className="h-full bg-[#B46A72] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <button
              type="button"
              onClick={toggleTimer}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow transition ${
                isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#B46A72] hover:bg-[#9f5961]'
              }`}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="p-2.5 rounded-xl border border-inherit opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/pomodoro')}
              className="p-2.5 rounded-xl bg-[#B46A72]/20 text-[#B46A72] hover:bg-[#B46A72]/30 transition font-bold text-xs px-3"
            >
              Full Page
            </button>
          </div>
        </div>
      ) : (
        /* Minimized Floating Pill */
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all group ${
            isDark
              ? 'bg-[#280B0F]/95 border-[#3B1319] text-[#C6B39A]'
              : 'bg-white/95 border-[#F7C8D3] text-[#2D3A47]'
          }`}
        >
          <button
            type="button"
            onClick={toggleTimer}
            className={`p-2 rounded-xl text-white shadow transition ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#B46A72] hover:bg-[#9f5961]'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer select-none flex items-center gap-3"
          >
            <div className="font-mono font-black text-lg tracking-wider">{formattedTime}</div>
            <div className="text-[10px] opacity-70 flex flex-col">
              <span className="uppercase font-bold text-[#B46A72]">{mode}</span>
              <span>{sessionsCompleted} done</span>
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-inherit pl-2 ml-1">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Expand widget"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMiniDismissed(true)}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
