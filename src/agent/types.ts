export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'final';
  text?: string;
  tool?: string;
  args?: Record<string, string | number>;
  result?: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}
