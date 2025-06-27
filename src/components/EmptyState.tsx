import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RobotIcon } from './icons';
import { EXAMPLE_PROMPTS } from '../constants';

const EmptyState: React.FC = () => {
  const { handleSendMessage, handleNewChat, conversations } = useAppContext();

  const handlePromptClick = (prompt: string) => {
    // If the current chat is the initial, empty one, use it. Otherwise, create a new one.
    if (conversations.length === 1 && conversations[0].messages.length === 1) {
       handleSendMessage(prompt);
    } else {
        handleNewChat();
        // A short timeout to allow the new chat state to settle before sending the message
        setTimeout(() => handleSendMessage(prompt), 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <RobotIcon className="h-16 w-16 text-brand-primary mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">AI Fault Diagnosis Agent</h2>
      <p className="text-brand-text-secondary mb-8 max-w-md">
        How can I help you today? Describe a problem, or start with one of the examples below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handlePromptClick(prompt)}
            className="p-4 bg-brand-surface rounded-lg text-left text-sm text-brand-text hover:bg-brand-border/70 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;