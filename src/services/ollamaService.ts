import { Message, Model } from '../types';

const OLLAMA_HOST = 'http://localhost:11434';

export async function* sendMessage(
  messages: Message[],
  model: string,
  signal: AbortSignal
): AsyncGenerator<string> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(({ id, ...rest }) => rest), // API doesn't need ID
        stream: true,
      }),
      signal, // Pass the abort signal to the fetch request
    });

    if (!response.ok || !response.body) {
      const errorBody = await response.text();
      console.error("Ollama API error:", response.status, errorBody);
      throw new Error(`Error: Could not connect to Ollama. Status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message && parsed.message.content) {
              yield parsed.message.content;
            }
            if (parsed.error) {
              throw new Error(`Ollama error: ${parsed.error}`);
            }
          } catch (e) {
            console.error("Failed to parse stream line:", line);
          }
        }
      }
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Request aborted by user.');
      // Gracefully exit the generator
      return;
    }
    console.error("Error calling Ollama:", error);
    yield `Error: Could not get a diagnosis. Please ensure your local Ollama server is running, the model '${model}' is available, and the server is accessible.`;
  }
}


export async function getAvailableModels(): Promise<Model[]> {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) {
        throw new Error('Failed to fetch models from Ollama.');
    }
    const data = await response.json();
    return data.models;
}