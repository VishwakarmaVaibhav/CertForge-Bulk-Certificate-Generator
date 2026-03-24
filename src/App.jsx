import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DesignerPanel from './components/DesignerPanel';
import DataPanel from './components/DataPanel';
import GeneratePanel from './components/GeneratePanel';

function AppContent() {
  const { state } = useAppContext();

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-dark-800 overflow-hidden">
        {state.currentStep === 0 && <DesignerPanel />}
        {state.currentStep === 1 && <DataPanel />}
        {state.currentStep === 2 && <GeneratePanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
