import { AuthProvider } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';
import AppShell from './AppShell';

export default function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </AuthProvider>
  );
}
