import React, { useState } from 'react';
import { Conversation } from '../types';
import { useAppContext } from '../context/AppContext';
import { CheckIcon, PencilIcon, PlusIcon, ShareIcon, TrashIcon, XIcon, RobotIcon, MenuIcon } from './icons';

const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    availableModels,
    selectedModel,
    modelError,
    isLoading,
    isSidebarOpen,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    handleSelectModel,
    setIsSidebarOpen,
  } = useAppContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRenameClick = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setRenameValue(conversation.title);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      handleRenameChat(id, renameValue.trim());
    }
    setEditingId(null);
  };
  
  const handleShare = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    const shareableText = conversation.messages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => `[${msg.role === 'model' ? 'AI' : 'User'}]:\n${msg.content}`)
        .join('\n\n---\n\n');

    try {
        await navigator.clipboard.writeText(shareableText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <div className={`absolute top-0 left-0 h-full w-64 bg-brand-surface flex flex-col p-2 space-y-2 border-r border-brand-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex z-40`}>
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
              <RobotIcon className="h-8 w-8 text-brand-primary" />
              <h1 className="text-lg font-bold text-white">Diagnosis AI</h1>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-md text-brand-text-secondary hover:bg-brand-border hover:text-white transition-colors"
            aria-label="New Chat"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`group relative flex items-center justify-between w-full text-left rounded-md p-2 text-sm transition-colors ${
                  activeConversationId === convo.id
                    ? 'bg-brand-primary/20 text-white'
                    : 'text-brand-text-secondary hover:bg-brand-border/50 hover:text-brand-text'
                }`}
              >
                {editingId === convo.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(convo.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(convo.id)}
                    className="flex-1 bg-transparent border-b border-brand-primary focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button onClick={() => { handleSelectChat(convo.id); setIsSidebarOpen(false); }} className="flex-1 truncate text-left">
                    {convo.title}
                  </button>
                )}
                <div className="absolute right-1 flex items-center bg-inherit">
                  {editingId === convo.id ? (
                      <>
                          <button onClick={() => handleRenameSubmit(convo.id)} className="p-1 hover:text-green-400"><CheckIcon className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 hover:text-red-400"><XIcon className="h-4 w-4"/></button>
                      </>
                  ) : (
                      <div className="hidden group-hover:flex items-center">
                          <button onClick={() => handleRenameClick(convo)} className="p-1 hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleShare(convo.id)} className="p-1 hover:text-white relative">
                            {copiedId === convo.id ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ShareIcon className="h-4 w-4" />}
                            {copiedId === convo.id && <span className="absolute -top-7 right-0 bg-brand-dark-bg px-2 py-1 text-xs rounded">Copied!</span>}
                          </button>
                          <button onClick={() => handleDeleteChat(convo.id)} className="p-1 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 border-t border-brand-border">
          <label htmlFor="model-select" className="text-xs text-brand-text-secondary mb-1 block">
            Select Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => handleSelectModel(e.target.value)}
            disabled={isLoading}
            className="w-full bg-brand-dark-bg border border-brand-border rounded-md p-2 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
          >
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          {modelError && <p className="text-xs text-red-400 mt-1">{modelError}</p>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;