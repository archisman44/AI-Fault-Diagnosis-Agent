import React from 'react';
import { ThumbsDownIcon, ThumbsUpIcon } from './icons';

interface FeedbackButtonsProps {
  onFeedback: (wasHelpful: boolean) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ onFeedback }) => {
  return (
    <div className="flex items-center justify-end space-x-2 border-t border-brand-border/50 pt-3">
       <span className="text-sm text-brand-text-secondary mr-2">Was this helpful?</span>
      <button
        onClick={() => onFeedback(true)}
        className="flex items-center gap-1.5 px-3 py-1 text-sm text-green-400 border border-green-400/30 bg-green-500/10 rounded-md hover:bg-green-500/20 transition-colors"
        aria-label="Helpful"
      >
        <ThumbsUpIcon className="h-4 w-4" />
        Yes
      </button>
      <button
        onClick={() => onFeedback(false)}
        className="flex items-center gap-1.5 px-3 py-1 text-sm text-red-400 border border-red-400/30 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
        aria-label="Not helpful"
      >
        <ThumbsDownIcon className="h-4 w-4" />
        No
      </button>
    </div>
  );
};

export default FeedbackButtons;