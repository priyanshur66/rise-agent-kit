import { CitreaAgent, type CitreaAgentConfig } from '../src/CitreaAgent.js';

export type CitreaAgentType = CitreaAgent;


export const createTestAgent = (config?: Partial<CitreaAgentConfig> & { personalityPrompt?: string }): CitreaAgent => {
  if (!config?.privateKey) {
    throw new Error('privateKey is required in config');
  }

  const defaultConfig: CitreaAgentConfig = {
    privateKey: config.privateKey,
    rpcUrl: config?.rpcUrl || 'https://testnet.citrea.xyz',
    model: config?.model || 'gpt-4o-mini',
    openAiApiKey: config?.openAiApiKey,
    anthropicApiKey: config?.anthropicApiKey,
    personalityPrompt: config?.personalityPrompt,
  };

  return new CitreaAgent(defaultConfig);
};


