import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SeoHead from './components/SeoHead';
import Dashboard from './pages/Dashboard';
import PracticesPage from './pages/PracticesPage';
import RulesPage from './pages/RulesPage';
import BookPage from './pages/BookPage';
import NotesPage from './pages/NotesPage';
import JournalPage from './pages/JournalPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';

export default function AppShell() {
  return (
    <BrowserRouter>
      <SeoHead />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practices" element={<PracticesPage />} />
          <Route path="/morning" element={<Navigate to="/practices?p=morning" replace />} />
          <Route path="/day" element={<Navigate to="/practices" replace />} />
          <Route path="/evening" element={<Navigate to="/practices?p=evening" replace />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
