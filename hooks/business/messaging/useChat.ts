export interface UseChatReturn {
  activeChatId: string | null;
  currentSession: null;
  sessionLoading: boolean;
  sessionError: string | null;
  availability: null;
  startChat: () => Promise<{ success: boolean }>;
}

export const useChat = (): UseChatReturn => ({
  activeChatId: null,
  currentSession: null,
  sessionLoading: false,
  sessionError: 'Canlı destek hizmeti geçici olarak devre dışıdır',
  availability: null,
  startChat: async () => ({ success: false }),
});

export const useChatSession = () => useChat();
export const useChatComposer = () => useChat();
