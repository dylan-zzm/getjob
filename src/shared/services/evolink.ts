import { getAllConfigs } from '@/shared/models/config';

type EvolinkMessageBlock =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'tool_use';
      id: string;
      name: string;
      input: Record<string, unknown>;
    };

interface EvolinkResponse {
  content?: EvolinkMessageBlock[];
  error?: {
    message?: string;
  };
}

interface EvolinkToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export async function callEvolinkTool<T>({
  prompt,
  system,
  tool,
  maxTokens = 4000,
  temperature = 0.2,
  useDirectUrl = false,
}: {
  prompt: string;
  system: string;
  tool: EvolinkToolDefinition;
  maxTokens?: number;
  temperature?: number;
  useDirectUrl?: boolean;
}): Promise<T> {
  const configs = await getAllConfigs();
  const apiKey = configs.evolink_api_key;
  const baseUrl = useDirectUrl
    ? configs.evolink_direct_base_url || configs.evolink_base_url
    : configs.evolink_base_url || configs.evolink_direct_base_url;
  const model = configs.evolink_model || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    throw new Error('evolink_api_key is not set');
  }

  if (!baseUrl) {
    throw new Error('evolink_base_url is not set');
  }

  const resp = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      tool_choice: {
        type: 'tool',
        name: tool.name,
        disable_parallel_tool_use: true,
      },
      tools: [
        {
          type: 'custom',
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!resp.ok) {
    const failure = (await safeReadJson(resp)) as EvolinkResponse;
    throw new Error(
      failure?.error?.message || `evolink request failed with status ${resp.status}`
    );
  }

  const payload = (await resp.json()) as EvolinkResponse;
  const toolUse = payload.content?.find(
    (block): block is Extract<EvolinkMessageBlock, { type: 'tool_use' }> =>
      block.type === 'tool_use' && block.name === tool.name
  );

  if (toolUse?.input) {
    return toolUse.input as T;
  }

  const textBlock = payload.content?.find(
    (block): block is Extract<EvolinkMessageBlock, { type: 'text' }> =>
      block.type === 'text'
  );

  if (textBlock?.text) {
    return JSON.parse(textBlock.text) as T;
  }

  throw new Error('evolink response did not contain a tool result');
}

async function safeReadJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}
