export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  showFeedback?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export interface Model {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
}