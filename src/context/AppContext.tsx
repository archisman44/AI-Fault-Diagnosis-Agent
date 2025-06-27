import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, Model } from '../types';
import { OLLAMA_MODELS_FALLBACK, SYSTEM_INSTRUCTION } from '../constants';
import { sendMessage, getAvailableModels } from '../services/ollamaService';

// Helper to generate a title from the first user message
const generateTitle = (messages: Message[]): string => {
  const userMessage = messages.find(m => m.role === 'user');
  if (!userMessage) return "New Chat";
  return userMessage.content.length > 30
    ? userMessage.content.substring(0, 27) + '...'
    : userMessage.content;
};

// Define the shape of the context
interface AppContextType {
  conversations: Conversation[];
  activeConversation: Conversation | undefined;
  activeConversationId: string | null;
  availableModels: Model[];
  selectedModel: string;
  modelError: string | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  handleNewChat: () => void;
  handleSelectChat: (id: string) => void;
  handleDeleteChat: (id: string) => void;
  handleRenameChat: (id: string, newTitle: string) => void;
  handleSelectModel: (model: string) => void;
  handleSendMessage: (userInput: string) => void;
  handleFeedback: (wasHelpful: boolean) => void;
  handleStopGeneration: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load state from sessionStorage on initial mount
  useEffect(() => {
    try {
      const storedConvos = sessionStorage.getItem('conversations');
      const storedActiveId = sessionStorage.getItem('activeConversationId');
      const storedModel = sessionStorage.getItem('selectedModel');

      if (storedConvos) setConversations(JSON.parse(storedConvos));
      if (storedActiveId) setActiveConversationId(JSON.parse(storedActiveId));
      if (storedModel) setSelectedModel(storedModel);

    } catch (error) {
      console.error("Failed to parse state from sessionStorage", error);
      sessionStorage.clear();
    }
  }, []);
  
  // Fetch available models on mount
  useEffect(() => {
    getAvailableModels()
      .then(models => {
        setAvailableModels(models);
        // If no model is selected, or selected model is not available, set a default
        if (!selectedModel || !models.some(m => m.name === selectedModel)) {
            setSelectedModel(models[0]?.name || '');
        }
      })
      .catch(err => {
        console.error(err);
        setModelError("Could not fetch models. Using fallback list.");
        setAvailableModels(OLLAMA_MODELS_FALLBACK.map(name => ({ name, model: name, modified_at: '', size: 0, digest: '', details: {} } as Model)));
        if (!selectedModel) {
            setSelectedModel(OLLAMA_MODELS_FALLBACK[0]);
        }
      });
  }, []); // Runs once on mount

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('conversations', JSON.stringify(conversations));
      if (activeConversationId) {
        sessionStorage.setItem('activeConversationId', JSON.stringify(activeConversationId));
      } else {
        sessionStorage.removeItem('activeConversationId');
      }
      if (selectedModel) {
        sessionStorage.setItem('selectedModel', selectedModel);
      }
    } catch (error) {
      console.error("Failed to save state to sessionStorage", error);
    }
  }, [conversations, activeConversationId, selectedModel]);
  
  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [{ id: uuidv4(), role: 'model', content: "Hello! Please describe the fault you're observing in your system." }]
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    setIsSidebarOpen(false);
  }, [isLoading]);
  
  // Auto-create a chat if none exist
  useEffect(() => {
    const noConvos = conversations.length === 0;
    if (noConvos && !isLoading) { // Check isLoading to prevent race conditions on init
      handleNewChat();
    }
  }, [conversations.length, isLoading, handleNewChat]);

  const handleSelectChat = (id: string) => {
    if (isLoading) return;
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setConversations(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };
  
  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
  };

  const _streamResponse = useCallback(async (messagesForApi: Omit<Message, 'id'>[], currentConversationId: string) => {
      const modelMessagePlaceholderId = uuidv4();
      setConversations(prev =>
          prev.map(c =>
              c.id === currentConversationId
                  ? { ...c, messages: [...c.messages, { id: modelMessagePlaceholderId, role: 'model', content: '' }] }
                  : c
          )
      );
      
      setIsLoading(true);
      const controller = new AbortController();
      setAbortController(controller);
      
      try {
          const stream = sendMessage(messagesForApi as Message[], selectedModel, controller.signal);

          for await (const chunk of stream) {
              setConversations(prev =>
                  prev.map(c => {
                      if (c.id !== currentConversationId) return c;
                      const newMessages = c.messages.map(m =>
                        m.id === modelMessagePlaceholderId
                          ? { ...m, content: m.content + chunk }
                          : m
                      );
                      return { ...c, messages: newMessages };
                  })
              );
          }
      } catch (error) {
          if ((error as Error).name !== 'AbortError') {
              console.error("Error during message streaming:", error);
                setConversations(prev =>
                  prev.map(c => {
                      if (c.id !== currentConversationId) return c;
                      const newMessages = c.messages.map(m =>
                        m.id === modelMessagePlaceholderId
                          ? { ...m, content: (error as Error).message }
                          : m
                      );
                      return { ...c, messages: newMessages };
                  })
              );
          }
      } finally {
          setIsLoading(false);
          setAbortController(null);
          setConversations(prev => prev.map(c => {
            if (c.id !== currentConversationId) return c;
            const finalMessages = c.messages.map(m => 
                m.id === modelMessagePlaceholderId ? { ...m, showFeedback: true } : m
            );
            const shouldUpdateTitle = c.title === 'New Chat' && finalMessages.some(msg => msg.role === 'user');
            return {
              ...c, 
              title: shouldUpdateTitle ? generateTitle(finalMessages) : c.title,
              messages: finalMessages
            };
          }));
      }
  }, [selectedModel]);

  const handleSendMessage = async (userInput: string) => {
    if (!activeConversationId || isLoading) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content: userInput };
    
    setConversations(prev =>
        prev.map(c => (c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage] } : c))
    );
    
    // Use a function form of setConversations to get the most up-to-date state
    setConversations(prev => {
        const currentConversation = prev.find(c => c.id === activeConversationId);
        if (!currentConversation) return prev;

        const apiMessages: Omit<Message, 'id'>[] = [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...currentConversation.messages.slice(1).map(({ id, showFeedback, ...rest }) => rest), // Exclude initial greeting and internal fields
        ];
        _streamResponse(apiMessages, activeConversationId);
        return prev;
    });
  };
  
  const handleFeedback = useCallback(async (wasHelpful: boolean) => {
    if (!activeConversationId) return;

    // Immediately hide feedback buttons
    setConversations(prev => prev.map(c => {
        if (c.id !== activeConversationId) return c;
        const newMessages = c.messages.map(m => m.showFeedback ? { ...m, showFeedback: false } : m);
        return { ...c, messages: newMessages };
    }));
    
    // Add response or trigger new generation
    setConversations(prev => {
        const currentConvo = prev.find(c => c.id === activeConversationId);
        if (!currentConvo) return prev;
        
        if (wasHelpful) {
            const thankYouMessage: Message = { id: uuidv4(), role: 'system', content: "Great! I'm glad I could help. Feel free to ask another question." };
            return prev.map(c => c.id === activeConversationId ? {...c, messages: [...c.messages, thankYouMessage]} : c);
        } else {
            const apiMessages: Omit<Message, 'id'>[] = [
                { role: 'system', content: SYSTEM_INSTRUCTION },
                ...currentConvo.messages.slice(1).map(({ id, showFeedback, ...rest }) => rest),
                { role: 'user', content: 'That was not helpful. Please provide an alternative diagnosis.' }
            ];
            _streamResponse(apiMessages, activeConversationId);
            return prev;
        }
    });
  }, [activeConversationId, _streamResponse]);


  const handleStopGeneration = () => {
    abortController?.abort();
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <AppContext.Provider value={{
      conversations,
      activeConversation,
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
      handleSendMessage,
      handleFeedback,
      handleStopGeneration,
      setIsSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};