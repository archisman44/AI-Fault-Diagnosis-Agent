import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import FeedbackButtons from './FeedbackButtons';
import { SendIcon, StopIcon, MenuIcon } from './icons';

const ChatInterface: React.FC = () => {
  const { 
    activeConversation, 
    handleSendMessage, 
    isLoading, 
    handleStopGeneration,
    handleFeedback,
    setIsSidebarOpen
  } = useAppContext();

  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [activeConversation?.messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    handleSendMessage(userInput);
    setUserInput('');
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden">
       <header className="p-4 border-b border-brand-border/50 flex items-center justify-center relative">
          <button onClick={() => setIsSidebarOpen(true)} className="absolute left-4 md:hidden p-2 text-brand-text-secondary">
            <MenuIcon className="h-6 w-6"/>
          </button>
          <h2 className="text-lg font-semibold text-white truncate px-12">{activeConversation.title}</h2>
        </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeConversation.messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in-up">
            <MessageBubble message={msg}>
              {msg.showFeedback && <FeedbackButtons onFeedback={handleFeedback} />}
            </MessageBubble>
          </div>
        ))}
        {isLoading && <div className="animate-fade-in-up"><LoadingSpinner /></div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-brand-border bg-brand-dark-bg/80 backdrop-blur-sm">
        {isLoading && (
            <div className="flex justify-center mb-3">
                <button
                    onClick={handleStopGeneration}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-surface border border-brand-border rounded-lg hover:bg-brand-border transition-colors"
                >
                    <StopIcon className="h-4 w-4" />
                    Stop generating
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., My car makes a clicking sound but won't start..."
            className="flex-1 bg-brand-surface border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-brand-primary text-white rounded-lg p-3 disabled:bg-brand-surface disabled:text-brand-text-secondary disabled:cursor-not-allowed hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-bg focus:ring-brand-primary transition-all duration-200 transform hover:scale-105 active:scale-100"
            aria-label="Send message"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </form>
         <footer className="w-full text-center p-2 mt-2 text-xs text-brand-text-secondary">
          <p>For informational purposes only. Always consult a qualified professional.</p>
        </footer>
      </div>
    </div>
  );
};

export default ChatInterface;