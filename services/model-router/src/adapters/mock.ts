import type { ModelAdapter, ModelResponse } from "@ai-workforce/shared";

export class MockAdapter implements ModelAdapter {
  readonly provider = "mock";

  async generateText(input: {
    model: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens: number;
    timeoutMs: number;
  }): Promise<ModelResponse> {
    void input.timeoutMs;
    const text = `[mock:${input.model}] ${input.prompt.slice(0, 200)}`;
    const inputTokens = Math.ceil(input.prompt.length / 4);
    const outputTokens = Math.ceil(text.length / 4);
    return {
      text,
      provider: this.provider,
      model: input.model,
      usage: {
        provider: this.provider,
        model: input.model,
        inputTokens,
        outputTokens,
        costUsd: 0,
      },
    };
  }
}
