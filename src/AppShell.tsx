import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useApp } from './context/AppStateContext';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MorningPage from './pages/MorningPage';
import DayPage from './pages/DayPage';
import EveningPage from './pages/EveningPage';
import RulesPage from './pages/RulesPage';
import BookPage from './pages/BookPage';
import NotesPage from './pages/NotesPage';
import JournalPage from './pages/JournalPage';

export default function AppShell() {
  const { onboardingCompleted, completeOnboarding } = useApp();

  if (!onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/morning" element={<MorningPage />} />
          <Route path="/day" element={<DayPage />} />
          <Route path="/evening" element={<EveningPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/journal" element={<JournalPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
