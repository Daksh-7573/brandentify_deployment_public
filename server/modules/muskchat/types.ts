export type MuskChatRole = "system" | "user" | "assistant";

export type MuskProvider = "gemini" | "ollama" | "openai" | "fallback";

export interface MuskChatInputMessage {
  role: MuskChatRole;
  content: string;
}

export interface MuskProviderResult {
  content: string;
  provider: MuskProvider;
  model: string;
  fallbackUsed: boolean;
}

export interface MuskStreamHandlers {
  onToken: (token: string) => void;
  onProvider?: (provider: MuskProvider, model: string) => void;
}

export interface AuthenticatedMuskUser {
  id: number;
  email?: string;
  name?: string;
}
