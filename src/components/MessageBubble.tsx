import React from 'react';
import { Message } from '../types';
import { UserIcon, RobotIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
  children?: React.ReactNode;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, children }) => {
  const isUserModel = message.role === 'model';
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="text-center text-sm text-brand-text-secondary italic my-4 px-4">
        {message.content}
      </div>
    );
  }
  
  // Render nothing for empty model messages (streaming placeholder)
  if (isUserModel && !message.content.trim()) {
    return null;
  }

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {isUserModel && (
        <div className="flex-shrink-0 bg-brand-surface h-9 w-9 rounded-full flex items-center justify-center text-brand-primary ring-1 ring-brand-border">
          <RobotIcon className="h-5 w-5" />
        </div>
      )}

      <div className={`max-w-2xl rounded-2xl p-4 ${isUser ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-brand-surface text-brand-text rounded-bl-lg'}`}>
        <div className="prose prose-sm prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0 whitespace-pre-wrap">{message.content}</div>
        {children && <div className="mt-3">{children}</div>}
      </div>

      {isUser && (
         <div className="flex-shrink-0 bg-brand-surface h-9 w-9 rounded-full flex items-center justify-center text-brand-text-secondary ring-1 ring-brand-border">
          <UserIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
