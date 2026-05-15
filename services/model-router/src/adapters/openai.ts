import type { ModelAdapter, ModelResponse } from "@ai-workforce/shared";

export class OpenAIAdapter implements ModelAdapter {
  readonly provider = "openai";

  constructor(private readonly apiKey: string) {}

  async generateText(input: {
    model: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens: number;
    timeoutMs: number;
  }): Promise<ModelResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: input.model,
          max_tokens: input.maxTokens,
          messages: [
            ...(input.systemPrompt
              ? [{ role: "system", content: input.systemPrompt }]
              : []),
            { role: "user", content: input.prompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };

      const text = data.choices[0]?.message.content ?? "";
      const inputTokens = data.usage?.prompt_tokens ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;

      return {
        text,
        provider: this.provider,
        model: input.model,
        usage: {
          provider: this.provider,
          model: input.model,
          inputTokens,
          outputTokens,
          costUsd: (inputTokens + outputTokens) * 0.000002,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
