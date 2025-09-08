import { RiseAgent, type RiseAgentConfig } from '../src/RiseAgent.js';

export type RiseAgentType = RiseAgent;


export const createTestAgent = (config?: Partial<RiseAgentConfig> & { personalityPrompt?: string }): RiseAgent => {
  if (!config?.privateKey) {
    throw new Error('privateKey is required in config');
  }

  const defaultConfig: RiseAgentConfig = {
    privateKey: config.privateKey,
    rpcUrl: config?.rpcUrl || 'https://testnet.riselabs.xyz',
    model: config?.model || 'gpt-4o-mini',
    openAiApiKey: config?.openAiApiKey,
    anthropicApiKey: config?.anthropicApiKey,
    personalityPrompt: config?.personalityPrompt,
  };

  return new RiseAgent(defaultConfig);
};


