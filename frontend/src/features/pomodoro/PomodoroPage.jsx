import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';
import { useTheme } from '@/context/ThemeContext';

export default function PomodoroPage() {
  const { isDark } = useTheme();
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
  } = usePomodoro();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#B46A72] text-white shadow-sm">
              <Timer size={22} />
            </span>
            <h1 className="text-3xl font-display font-bold tracking-tight text-inherit">Pomodoro Timer</h1>
          </div>
          <p className="text-sm opacity-70 mt-1">
            Boost your study focus with structured intervals and timed breaks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
          >
            <Flame size={16} className="text-[#B46A72]" />
            <span>{sessionsCompleted} Sessions Completed Today</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
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
          isDark
            ? 'bg-gradient-to-br from-[#280B0F] to-[#3B1319]/80 border-[#3B1319] text-[#C6B39A]'
            : 'bg-gradient-to-br from-white to-[#FFF5F6] border-[#F7C8D3] text-[#2D3A47]'
        }`}
      >
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-black/10 dark:bg-black/30 mb-8 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'pomodoro'
                ? 'bg-[#B46A72] text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Study Focus (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'shortBreak'
                ? 'bg-[#B46A72] text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('longBreak')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'longBreak'
                ? 'bg-[#B46A72] text-white shadow-md'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Countdown Display */}
        <div className="my-6 relative">
          <div className="text-7xl md:text-9xl font-mono font-black tracking-wider text-inherit drop-shadow-sm">
            {formattedTime}
          </div>
          <p className="text-xs uppercase tracking-widest opacity-60 mt-3 font-semibold">
            {mode === 'pomodoro' ? 'Stay focused on your task' : 'Time to relax & recharge'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto w-full h-2 rounded-full bg-black/10 dark:bg-black/30 mb-10 overflow-hidden">
          <div
            className="h-full bg-[#B46A72] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center gap-3 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#B46A72] hover:bg-[#9f5961] text-white scale-105'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} /> Pause Focus
              </>
            ) : (
              <>
                <Play size={20} /> Start Focus
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'border-[#7B694E]/40 hover:bg-[#3B1319] text-[#C6B39A]'
                : 'border-[#2D3A47]/20 hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
            title="Reset timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Quick Tips & Streak Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isDark ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[#B46A72]">
            <Sparkles size={18} />
            <h3>Pomodoro Technique</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Work in 25-minute focused bursts, then take a 5-minute break. After 4 sessions, take a longer 15-minute break.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isDark ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[#B46A72]">
            <CheckCircle2 size={18} />
            <h3>Task Linked Focus</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Every session completed today counts towards your daily syllabus goals and revision mastery score.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isDark ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[#B46A72]">
            <Flame size={18} />
            <h3>Study Streak</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            You are on a 5-day study streak! Complete 2 more focus sessions today to keep your flame active.
          </p>
        </div>
      </div>
    </div>
  );
}
