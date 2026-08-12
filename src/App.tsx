import { AppStateProvider } from './context/AppStateContext';
import AppShell from './AppShell';

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
