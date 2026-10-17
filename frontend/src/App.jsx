import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppLayout } from '@/components/AppLayout';
import LoginPage from '@/features/auth/LoginPage';
import DSATrackerPage from '@/features/dsatracker/DSATrackerPage';
import EnhancedTodoPage from '@/features/todo/EnhancedTodoPage';
import SchedulePage from '@/features/schedule/SchedulePage';
import NotesPage from '@/features/notes/NotesPage';
import TopicWorkspacePage from '@/features/workspace/TopicWorkspacePage';
import StandaloneNotesPage from '@/features/notes/StandaloneNotesPage';
import PomodoroPage from '@/features/pomodoro/PomodoroPage';
import SettingsPage from '@/features/settings/SettingsPage';
import AIAssistantPage from '@/features/ai/AIStudyAssistantPage';
import FlashcardsPage from '@/features/flashcards/FlashcardPage';
import ExamPrepPage from '@/features/examprep/ExamPrepPage';
import QuestionBankPage from '@/features/questionbank/QuestionBankPage';
import AnalyticsPage from '@/features/analytics/AnalyticsPage';

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
              <Route path="/subjects/:subjectId/topics/:topicId" element={<TopicWorkspacePage />} />
              <Route path="/standalone-notes" element={<StandaloneNotesPage />} />
              <Route path="/pomodoro" element={<PomodoroPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/exam-prep" element={<ExamPrepPage />} />
              <Route path="/question-bank" element={<QuestionBankPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
