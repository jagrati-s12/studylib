import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppLayout } from '@/components/AppLayout';
import EnhancedTodoPage from '@/features/todo/EnhancedTodoPage';
import SchedulePage from '@/features/schedule/SchedulePage';
import NotesPage from '@/features/notes/NotesPage';
import TopicWorkspacePage from '@/features/workspace/TopicWorkspacePage';
import StandaloneNotesPage from '@/features/notes/StandaloneNotesPage';
import SettingsPage from '@/features/settings/SettingsPage';
import AIAssistantPage from '@/features/ai/AIStudyAssistantPage';
import FlashcardsPage from '@/features/flashcards/FlashcardPage';
import PomodoroPage from '@/features/pomodoro/PomodoroPage';
import StudyPlanPage from '@/features/study-plan/StudyPlanPage';
import StudyDashboardPage from '@/features/dashboard/StudyDashboardPage';

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
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/notes" replace />} />
              <Route path="/todo" element={<EnhancedTodoPage />} />
              <Route path="/pomodoro" element={<PomodoroPage />} />
              <Route path="/study-plan" element={<StudyPlanPage />} />
              <Route path="/study-dashboard" element={<StudyDashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/notes" replace />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/subjects/:subjectId/topics/:topicId" element={<TopicWorkspacePage />} />
              <Route path="/standalone-notes" element={<StandaloneNotesPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/todo" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
