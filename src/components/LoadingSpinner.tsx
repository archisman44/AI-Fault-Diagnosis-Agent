import React from 'react';
import { RobotIcon } from './icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4">
      <div className="flex-shrink-0 bg-brand-surface h-9 w-9 rounded-full flex items-center justify-center text-brand-primary ring-1 ring-brand-border">
        <RobotIcon className="h-5 w-5" />
      </div>
      <div className="bg-brand-surface text-brand-text rounded-2xl rounded-bl-lg p-4 flex items-center space-x-2">
        <div className="w-2.5 h-2.5 bg-brand-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-brand-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-brand-text-secondary rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
