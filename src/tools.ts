import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Import functions
import { transferETH } from './tools/citrea/ETHOperations.js';
import { transferErc20, burnErc20 } from './tools/citrea/erc20Operations.js';
import { getETHBalance } from './tools/citrea/getETHBalance.js';
import { getErc20Balance } from './tools/citrea/getErc20Balance.js';
import { deployContract } from './tools/citrea/deployContract.js';
import {
  swapExactTokensForTokens,
  swapTokensForExactTokens,
  exactInputSingle,
  exactOutputSingle
} from './tools/citrea/swapOperations.js';
import { setCurrentPrivateKey } from './core/client.js';

// Types
type CitreaAgentInterface = {
  getCredentials: () => { privateKey: string };
};

/**
 * Wraps a function to inject the private key from the agent
 * @param fn - The function to wrap
 * @param agent - The CitreaAgent instance containing credentials
 */
const withPrivateKey = <T>(
  fn: (params: T) => Promise<any>,
  agent: CitreaAgentInterface,
) => {
  return (params: T) => {
    // Set the private key in the client before calling the function
    const credentials = agent.getCredentials();
    setCurrentPrivateKey(credentials.privateKey);
    return fn(params);
  };
};

// Schema definitions
const transferCBTCSchema = z.object({
  toAddress: z.string().describe('The wallet address to transfer CBTC to'),
  amount: z.string().describe('The amount of CBTC to transfer'),
});

const transferErc20Schema = z.object({
  tokenAddress: z.string().describe('The ERC20 token contract address'),
  toAddress: z.string().describe('The wallet address to transfer tokens to'),
  amount: z.string().describe('The amount of tokens to transfer'),
});

const burnErc20Schema = z.object({
  tokenAddress: z.string().describe('The ERC20 token contract address'),
  amount: z.string().describe('The amount of tokens to burn'),
});

const getCBTCBalanceSchema = z.object({
  walletAddress: z.string().nullable().optional().describe('The wallet address to check CBTC balance (optional, uses agent wallet if not provided)'),
});

const getErc20BalanceSchema = z.object({
  tokenAddress: z.string().describe('The ERC20 token contract address'),
  walletAddress: z.string().nullable().optional().describe('The wallet address to check balance (optional, uses agent wallet if not provided)'),
});

const deployContractSchema = z.object({
  abi: z.array(z.record(z.any())).describe('The contract ABI as an array of objects'),
  bytecode: z.string().describe('The contract bytecode'),
  args: z.array(z.union([z.string(), z.number(), z.boolean()])).nullable().optional().describe('Constructor arguments (optional)'),
});

const swapExactTokensForTokensSchema = z.object({
  amountIn: z.string().describe('The amount of tokens to swap (e.g., "1.0")'),
  amountOutMin: z.string().describe('The minimum amount of tokens to receive (e.g., "0.99")'),
  path: z.array(z.string()).describe('Array of token addresses for the swap path (e.g., ["0xTokenA", "0xTokenB"])'),
  to: z.string().describe('The recipient address for the swapped tokens'),
  deadline: z.number().optional().describe('Optional deadline timestamp (default: current time + 20 minutes)'),
});

const swapTokensForExactTokensSchema = z.object({
  amountOut: z.string().describe('The exact amount of tokens to receive (e.g., "1.0")'),
  amountInMax: z.string().describe('The maximum amount of tokens to spend (e.g., "1.01")'),
  path: z.array(z.string()).describe('Array of token addresses for the swap path (e.g., ["0xTokenA", "0xTokenB"])'),
  to: z.string().describe('The recipient address for the swapped tokens'),
  deadline: z.number().optional().describe('Optional deadline timestamp (default: current time + 20 minutes)'),
});

const exactInputSingleSchema = z.object({
  tokenIn: z.string().describe('The input token contract address'),
  tokenOut: z.string().describe('The output token contract address'),
  fee: z.number().describe('The pool fee tier (500, 3000, or 10000)'),
  recipient: z.string().describe('The recipient address for the swapped tokens'),
  amountIn: z.string().describe('The amount of input tokens to swap (e.g., "1.0")'),
  amountOutMinimum: z.string().describe('The minimum amount of output tokens to receive (e.g., "0.99")'),
  sqrtPriceLimitX96: z.string().optional().describe('Optional price limit for the swap'),
});

const exactOutputSingleSchema = z.object({
  tokenIn: z.string().describe('The input token contract address'),
  tokenOut: z.string().describe('The output token contract address'),
  fee: z.number().describe('The pool fee tier (500, 3000, or 10000)'),
  recipient: z.string().describe('The recipient address for the swapped tokens'),
  amountOut: z.string().describe('The exact amount of output tokens to receive (e.g., "1.0")'),
  amountInMaximum: z.string().describe('The maximum amount of input tokens to spend (e.g., "1.01")'),
  sqrtPriceLimitX96: z.string().optional().describe('Optional price limit for the swap'),
});

/**
 * Creates and returns all tools with injected agent credentials
 */
export const createTools = (agent: CitreaAgentInterface) => [
  tool(withPrivateKey(transferETH, agent), {
    name: 'transfer_cbtc',
    description: 'Transfer CBTC (native CBTC token) to another wallet',
    schema: transferCBTCSchema,
  }),

  tool(withPrivateKey(transferErc20, agent), {
    name: 'transfer_erc20',
    description: 'Transfer ERC20 tokens to another wallet',
    schema: transferErc20Schema,
  }),

  tool(withPrivateKey(burnErc20, agent), {
    name: 'burn_erc20',
    description: 'Burn ERC20 tokens (send to burn address)',
    schema: burnErc20Schema,
  }),

  tool(withPrivateKey(getETHBalance, agent), {
    name: 'get_cbtc_balance',
    description: 'Get CBTC balance of a wallet',
    schema: getCBTCBalanceSchema,
  }),

  tool(withPrivateKey(getErc20Balance, agent), {
    name: 'get_erc20_balance',
    description: 'Get ERC20 token balance of a wallet',
    schema: getErc20BalanceSchema,
  }),

  tool(withPrivateKey(deployContract, agent), {
    name: 'deploy_contract',
    description: 'Deploy a smart contract to Citrea network',
    schema: deployContractSchema,
  }),

  tool(withPrivateKey(swapExactTokensForTokens, agent), {
    name: 'swap_exact_tokens_for_tokens',
    description: 'Swap exact amount of tokens for tokens (V2 style) - specify input amount and minimum output',
    schema: swapExactTokensForTokensSchema,
  }),

  tool(withPrivateKey(swapTokensForExactTokens, agent), {
    name: 'swap_tokens_for_exact_tokens',
    description: 'Swap tokens for exact amount of tokens (V2 style) - specify exact output and maximum input',
    schema: swapTokensForExactTokensSchema,
  }),

  tool(withPrivateKey(exactInputSingle, agent), {
    name: 'exact_input_single',
    description: 'V3 exact input single swap - swap exact amount of one token for another through a single pool',
    schema: exactInputSingleSchema,
  }),

  tool(withPrivateKey(exactOutputSingle, agent), {
    name: 'exact_output_single',
    description: 'V3 exact output single swap - swap tokens to receive exact amount through a single pool',
    schema: exactOutputSingleSchema,
  }),
];
