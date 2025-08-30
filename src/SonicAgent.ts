import { transferS } from './tools/rise/ETHOperations.js';
import { transferErc20, burnErc20 } from './tools/rise/erc20Operations.js';
import { getSBalance } from './tools/rise/getETHBalance.js';
import { getErc20Balance } from './tools/rise/getErc20Balance.js';
import { deployContract } from './tools/rise/deployContract.js';
import { initializeClient, setCurrentPrivateKey } from './core/client.js';
import { createAgent } from './agent.js';
import type { AgentExecutor } from 'langchain/agents';
import type { modelMapping } from './utils/models.js';

export interface RiseAgentConfig {
  privateKey: string;
  rpcUrl: string;
  model: keyof typeof modelMapping;
  openAiApiKey?: string;
  anthropicApiKey?: string;
}

export interface TransferETHParams {
  toAddress: string;
  amount: string;
}

export interface TransferErc20Params {
  tokenAddress: string;
  toAddress: string;
  amount: string | number;
}

export interface BurnErc20Params {
  tokenAddress: string;
  amount: string | number;
}

export interface GetErc20BalanceParams {
  tokenAddress: string;
  walletAddress?: string;
}

export interface DeployContractParams {
  abi: any[];
  bytecode: string;
  args?: any[];
}

export class RiseAgent {
  private privateKey: string;
  private rpcUrl: string;
  private agentExecutor: AgentExecutor;
  private model: keyof typeof modelMapping;
  private openAiApiKey?: string;
  private anthropicApiKey?: string;

  constructor(config: RiseAgentConfig) {
    this.privateKey = config.privateKey;
    this.rpcUrl = config.rpcUrl;
    this.model = config.model;
    this.openAiApiKey = config.openAiApiKey;
    this.anthropicApiKey = config.anthropicApiKey;

    if (!this.privateKey) {
      throw new Error('Private key is required.');
    }

    if (!this.rpcUrl) {
      throw new Error('RPC URL is required.');
    }

    // Initialize the client with this agent's configuration
    initializeClient(this.privateKey, this.rpcUrl);

    this.agentExecutor = createAgent(
      this,
      this.model,
      this.openAiApiKey,
      this.anthropicApiKey,
    );
  }

  getCredentials() {
    return {
      privateKey: this.privateKey,
      openAiApiKey: this.openAiApiKey || '',
      anthropicApiKey: this.anthropicApiKey || '',
    };
  }

  async execute(input: string) {
    // Ensure the private key is set before each execution
    setCurrentPrivateKey(this.privateKey);
    
    const response = await this.agentExecutor.invoke({
      input,
    });

    return response;
  }

  async transferETH(params: TransferETHParams) {
    setCurrentPrivateKey(this.privateKey);
    return await transferS(params);
  }

  async transferErc20(params: TransferErc20Params) {
    setCurrentPrivateKey(this.privateKey);
    return await transferErc20(params);
  }

  async burnErc20(params: BurnErc20Params) {
    setCurrentPrivateKey(this.privateKey);
    return await burnErc20(params);
  }

  async getSBalance(params?: { walletAddress?: string }) {
    setCurrentPrivateKey(this.privateKey);
    return await getSBalance(params || {});
  }

  async getErc20Balance(params: GetErc20BalanceParams) {
    setCurrentPrivateKey(this.privateKey);
    return await getErc20Balance(params);
  }

  async deployContract(params: DeployContractParams) {
    setCurrentPrivateKey(this.privateKey);
    return await deployContract(params);
  }
}
