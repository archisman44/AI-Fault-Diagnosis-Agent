import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import EmptyState from './components/EmptyState';

const AppContent: React.FC = () => {
  const { activeConversation } = useAppContext();

  return (
    <div className="h-dvh w-screen bg-brand-dark-bg text-brand-text font-sans flex overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {activeConversation ? <ChatInterface /> : <EmptyState />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;