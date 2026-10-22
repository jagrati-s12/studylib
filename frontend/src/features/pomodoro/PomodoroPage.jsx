import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, CheckCircle2, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';
import { useTheme } from '@/context/ThemeContext';

export default function PomodoroPage() {
  const { isDark, isNotion } = useTheme();
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    soundEnabled,
    setSoundEnabled,
    switchMode,
    toggleTimer,
    resetTimer,
    formattedTime,
    progressPercent,
    durations,
    updateDuration,
  } = usePomodoro();

  const [pomodoroMinsInput, setPomodoroMinsInput] = useState(25);
  const [breakMinsInput, setBreakMinsInput] = useState(5);

  const handleApplyCustomTime = (e) => {
    e.preventDefault();
    updateDuration(Number(pomodoroMinsInput) || 25, Number(breakMinsInput) || 5);
  };

  const activeModeBtnStyle = isNotion
    ? isDark
      ? 'bg-[#2F2F2F] text-white border border-[#373737] shadow-md'
      : 'bg-[#37352F] text-white shadow-md'
    : 'bg-[#B46A72] text-white shadow-md';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl text-white shadow-sm ${isNotion ? (isDark ? 'bg-[#2F2F2F] border border-[#373737]' : 'bg-[#37352F]') : 'bg-[#B46A72]'}`}>
              <Timer size={22} />
            </span>
            <h1 className="text-3xl font-display font-bold tracking-tight text-inherit">Study Timer & Stopwatch</h1>
          </div>
          <p className="text-sm opacity-70 mt-1">
            Boost your study focus with structured intervals or study as long as you want with the stopwatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold ${
              isNotion
                ? isDark
                  ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
                  : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
                : isDark
                ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
          >
            <Flame size={16} className={isNotion ? (isDark ? 'text-amber-400' : 'text-[#37352F]') : 'text-[#B46A72]'} />
            <span>{sessionsCompleted} Sessions Completed Today</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isNotion
                ? isDark
                  ? 'bg-[#202020] border-[#373737] text-[#D4D4D4] hover:bg-[#2F2F2F]'
                  : 'bg-white border-[#E9E9E7] text-[#37352F] hover:bg-[#EFEFED] shadow-sm'
                : isDark
                ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Main Timer Widget Card */}
      <div
        className={`p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden transition-all shadow-lg ${
          isNotion
            ? isDark
              ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
              : 'bg-white border-[#E9E9E7] text-[#37352F]'
            : isDark
            ? 'bg-gradient-to-br from-[#280B0F] to-[#3B1319]/80 border-[#3B1319] text-[#C6B39A]'
            : 'bg-gradient-to-br from-white to-[#FFF5F6] border-[#F7C8D3] text-[#2D3A47]'
        }`}
      >
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-black/10 dark:bg-black/30 mb-8 backdrop-blur-sm gap-1">
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'pomodoro' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            Study Focus ({Math.round(durations.pomodoro / 60)}m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            disabled={isRunning && mode === 'pomodoro'}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRunning && mode === 'pomodoro' ? 'opacity-40 cursor-not-allowed' : ''
            } ${
              mode === 'shortBreak' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            Short Break ({Math.round(durations.shortBreak / 60)}m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('stopwatch')}
            disabled={isRunning && mode !== 'stopwatch'}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRunning && mode !== 'stopwatch' ? 'opacity-40 cursor-not-allowed' : ''
            } ${
              mode === 'stopwatch' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative my-6">
          <div className="text-7xl md:text-9xl font-display font-black tracking-tighter tabular-nums mb-2">
            {formattedTime}
          </div>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest">
            {mode === 'pomodoro' ? 'Focus Session' : mode === 'shortBreak' ? 'Break Time' : 'Elapsed Study Time'}
          </p>
        </div>

        {/* Progress Bar */}
        {mode !== 'stopwatch' && (
          <div className="max-w-md mx-auto w-full bg-black/10 dark:bg-black/40 h-2.5 rounded-full overflow-hidden mb-10">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                isNotion ? (isDark ? 'bg-white' : 'bg-[#37352F]') : 'bg-[#B46A72]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : isNotion
                ? isDark
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-[#37352F] text-white hover:bg-black'
                : 'bg-[#B46A72] hover:bg-[#9E5860] text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} /> Pause Timer
              </>
            ) : (
              <>
                <Play size={20} /> Start Session
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              isNotion
                ? isDark
                  ? 'bg-[#191919] border-[#373737] hover:bg-[#2F2F2F]'
                  : 'bg-white border-[#E9E9E7] hover:bg-[#EFEFED] shadow-sm'
                : isDark
                ? 'bg-[#1E080C] border-[#3B1319] hover:bg-[#3B1319]/80'
                : 'bg-white border-[#F7C8D3] hover:bg-[#FFF5F6] shadow-sm'
            }`}
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Custom Duration Settings */}
        {mode !== 'stopwatch' && !isRunning && (
          <form onSubmit={handleApplyCustomTime} className="mt-12 pt-8 border-t border-inherit flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="font-semibold opacity-70">Customize Durations (Minutes):</span>
            <div className="flex items-center gap-2">
              <label htmlFor="pomodoro-mins-input" className="opacity-60">Focus:</label>
              <input
                id="pomodoro-mins-input"
                type="number"
                min="1"
                max="120"
                value={pomodoroMinsInput}
                onChange={(e) => setPomodoroMinsInput(e.target.value)}
                className={`w-16 px-2.5 py-1.5 rounded-lg border text-center font-bold outline-none ${
                  isNotion
                    ? isDark ? 'bg-[#191919] border-[#373737]' : 'bg-white border-[#E9E9E7]'
                    : isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="break-mins-input" className="opacity-60">Break:</label>
              <input
                id="break-mins-input"
                type="number"
                min="1"
                max="60"
                value={breakMinsInput}
                onChange={(e) => setBreakMinsInput(e.target.value)}
                className={`w-16 px-2.5 py-1.5 rounded-lg border text-center font-bold outline-none ${
                  isNotion
                    ? isDark ? 'bg-[#191919] border-[#373737]' : 'bg-white border-[#E9E9E7]'
                    : isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'
                }`}
              />
            </div>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                isNotion
                  ? isDark ? 'bg-[#2F2F2F] text-white hover:bg-neutral-700' : 'bg-[#37352F] text-white hover:bg-black'
                  : 'bg-[#B46A72] text-white hover:bg-[#9E5860]'
              }`}
            >
              Apply
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
