import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { AppLayout } from '@/components/AppLayout';

// Lazy loaded page components for fast instant initial loading
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DSATrackerPage = lazy(() => import('@/features/dsatracker/DSATrackerPage'));
const EnhancedTodoPage = lazy(() => import('@/features/todo/EnhancedTodoPage'));
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage'));
const NotesPage = lazy(() => import('@/features/notes/NotesPage'));
const TopicWorkspacePage = lazy(() => import('@/features/workspace/TopicWorkspacePage'));
const StandaloneNotesPage = lazy(() => import('@/features/notes/StandaloneNotesPage'));
const PomodoroPage = lazy(() => import('@/features/pomodoro/PomodoroPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const AIAssistantPage = lazy(() => import('@/features/ai/AIStudyAssistantPage'));
const ExamPrepPage = lazy(() => import('@/features/examprep/ExamPrepPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'));
const SubjectPage = lazy(() => import('@/features/subjects/SubjectPage'));

function PageLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#B46A72] border-t-transparent" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PomodoroProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Login Selection Page */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dsatracker" element={<DSATrackerPage />} />

                {/* Main App Layout with Sidebar */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/todo" element={<EnhancedTodoPage />} />
                  <Route path="/dashboard" element={<Navigate to="/notes" replace />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/subjects/:subjectId" element={<SubjectPage />} />
                  <Route path="/subjects/:subjectId/topics/:topicId" element={<TopicWorkspacePage />} />
                  <Route path="/standalone-notes" element={<StandaloneNotesPage />} />
                  <Route path="/pomodoro" element={<PomodoroPage />} />
                  <Route path="/exam-prep" element={<ExamPrepPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PomodoroProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
