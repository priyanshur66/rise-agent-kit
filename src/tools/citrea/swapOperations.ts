import { ethers, parseEther } from "ethers";
import { getSigner, getProvider } from "../../core/client";
import { universalRouterAbi } from "./abis";

// Universal Router contract address on Citrea testnet
const UNIVERSAL_ROUTER_ADDRESS = "0x610c98EAD0df13EA906854b6041122e8A8D14413";

export interface SwapExactTokensForTokensParams {
  amountIn: string;
  amountOutMin: string;
  path: string[]; // Array of token addresses
  to: string;
  deadline?: number; // Optional deadline (default: current time + 20 minutes)
}

export interface SwapTokensForExactTokensParams {
  amountOut: string;
  amountInMax: string;
  path: string[]; // Array of token addresses
  to: string;
  deadline?: number; // Optional deadline (default: current time + 20 minutes)
}

export interface ExactInputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number; // Pool fee (500, 3000, or 10000)
  recipient: string;
  amountIn: string;
  amountOutMinimum: string;
  sqrtPriceLimitX96?: string; // Optional price limit
}

export interface ExactOutputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number; // Pool fee (500, 3000, or 10000)
  recipient: string;
  amountOut: string;
  amountInMaximum: string;
  sqrtPriceLimitX96?: string; // Optional price limit
}

/**
 * Swap exact tokens for tokens (V2 style swap)
 */
export const swapExactTokensForTokens = async ({
  amountIn,
  amountOutMin,
  path,
  to,
  deadline
}: SwapExactTokensForTokensParams): Promise<string> => {
  try {
    // Validate required parameters
    if (!amountIn || Number(amountIn) <= 0) {
      throw new Error("Amount in must be greater than 0");
    }

    if (!amountOutMin || Number(amountOutMin) <= 0) {
      throw new Error("Amount out minimum must be greater than 0");
    }

    if (!path || path.length < 2) {
      throw new Error("Path must contain at least 2 token addresses");
    }

    if (!to) {
      throw new Error("Recipient address is required");
    }

    // Validate addresses
    for (const address of path) {
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid token address in path: ${address}`);
      }
    }

    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    const signer = getSigner();
    const provider = getProvider();

    if (!signer) {
      throw new Error("Signer not initialized");
    }

    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Convert amounts to wei
    const amountInWei = parseEther(amountIn);
    const amountOutMinWei = parseEther(amountOutMin);

    // Set deadline (default: current time + 20 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const defaultDeadline = currentTimestamp + (20 * 60); // 20 minutes
    const finalDeadline = deadline || defaultDeadline;

    // Create contract instance
    const routerContract = new ethers.Contract(
      UNIVERSAL_ROUTER_ADDRESS,
      universalRouterAbi,
      signer
    );

    console.log(`Swapping ${amountIn} tokens from ${path[0]} to ${path[path.length - 1]}...`);

    // Execute swap
    const tx = await routerContract.swapExactTokensForTokens(
      amountInWei,
      amountOutMinWei,
      path,
      to,
      finalDeadline
    );

    console.log(`Swap transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }

    if (receipt.status !== 1) {
      throw new Error("Swap transaction failed");
    }

    console.log(`✅ Swap completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;

  } catch (error: any) {
    console.error("Swap failed:", error.message);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for swap");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during swap");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Swap transaction timed out");
    } else if (error.message.includes("insufficient")) {
      throw new Error("Insufficient token balance for swap");
    } else if (error.message.includes("allowance") || error.message.includes("approve")) {
      throw new Error("Token approval required for swap");
    }

    throw new Error(`Swap failed: ${error.message}`);
  }
};

/**
 * Swap tokens for exact tokens (V2 style swap)
 */
export const swapTokensForExactTokens = async ({
  amountOut,
  amountInMax,
  path,
  to,
  deadline
}: SwapTokensForExactTokensParams): Promise<string> => {
  try {
    // Validate required parameters
    if (!amountOut || Number(amountOut) <= 0) {
      throw new Error("Amount out must be greater than 0");
    }

    if (!amountInMax || Number(amountInMax) <= 0) {
      throw new Error("Amount in maximum must be greater than 0");
    }

    if (!path || path.length < 2) {
      throw new Error("Path must contain at least 2 token addresses");
    }

    if (!to) {
      throw new Error("Recipient address is required");
    }

    // Validate addresses
    for (const address of path) {
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid token address in path: ${address}`);
      }
    }

    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    const signer = getSigner();
    const provider = getProvider();

    if (!signer) {
      throw new Error("Signer not initialized");
    }

    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Convert amounts to wei
    const amountOutWei = parseEther(amountOut);
    const amountInMaxWei = parseEther(amountInMax);

    // Set deadline (default: current time + 20 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const defaultDeadline = currentTimestamp + (20 * 60); // 20 minutes
    const finalDeadline = deadline || defaultDeadline;

    // Create contract instance
    const routerContract = new ethers.Contract(
      UNIVERSAL_ROUTER_ADDRESS,
      universalRouterAbi,
      signer
    );

    console.log(`Swapping tokens to receive exactly ${amountOut} of ${path[path.length - 1]}...`);

    // Execute swap
    const tx = await routerContract.swapTokensForExactTokens(
      amountOutWei,
      amountInMaxWei,
      path,
      to,
      finalDeadline
    );

    console.log(`Swap transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }

    if (receipt.status !== 1) {
      throw new Error("Swap transaction failed");
    }

    console.log(`✅ Swap completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;

  } catch (error: any) {
    console.error("Swap failed:", error.message);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for swap");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during swap");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Swap transaction timed out");
    } else if (error.message.includes("insufficient")) {
      throw new Error("Insufficient token balance for swap");
    } else if (error.message.includes("allowance") || error.message.includes("approve")) {
      throw new Error("Token approval required for swap");
    }

    throw new Error(`Swap failed: ${error.message}`);
  }
};

/**
 * Exact input single swap (V3 style swap)
 */
export const exactInputSingle = async ({
  tokenIn,
  tokenOut,
  fee,
  recipient,
  amountIn,
  amountOutMinimum,
  sqrtPriceLimitX96
}: ExactInputSingleParams): Promise<string> => {
  try {
    // Validate required parameters
    if (!ethers.isAddress(tokenIn)) {
      throw new Error("Invalid tokenIn address");
    }

    if (!ethers.isAddress(tokenOut)) {
      throw new Error("Invalid tokenOut address");
    }

    if (!recipient) {
      throw new Error("Recipient address is required");
    }

    if (!ethers.isAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    if (!amountIn || Number(amountIn) <= 0) {
      throw new Error("Amount in must be greater than 0");
    }

    if (!amountOutMinimum || Number(amountOutMinimum) <= 0) {
      throw new Error("Amount out minimum must be greater than 0");
    }

    // Validate fee tier
    const validFees = [500, 3000, 10000];
    if (!validFees.includes(fee)) {
      throw new Error("Invalid fee tier. Must be 500, 3000, or 10000");
    }

    const signer = getSigner();
    const provider = getProvider();

    if (!signer) {
      throw new Error("Signer not initialized");
    }

    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Convert amounts to wei
    const amountInWei = parseEther(amountIn);
    const amountOutMinimumWei = parseEther(amountOutMinimum);

    // Create contract instance
    const routerContract = new ethers.Contract(
      UNIVERSAL_ROUTER_ADDRESS,
      universalRouterAbi,
      signer
    );

    // Prepare parameters
    const params = {
      tokenIn,
      tokenOut,
      fee,
      recipient,
      amountIn: amountInWei,
      amountOutMinimum: amountOutMinimumWei,
      sqrtPriceLimitX96: sqrtPriceLimitX96 || "0"
    };

    console.log(`V3 Exact input swap: ${amountIn} ${tokenIn} to ${tokenOut}...`);

    // Execute swap
    const tx = await routerContract.exactInputSingle(params);

    console.log(`Swap transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }

    if (receipt.status !== 1) {
      throw new Error("Swap transaction failed");
    }

    console.log(`✅ V3 Swap completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;

  } catch (error: any) {
    console.error("V3 Swap failed:", error.message);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for swap");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during swap");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Swap transaction timed out");
    } else if (error.message.includes("insufficient")) {
      throw new Error("Insufficient token balance for swap");
    } else if (error.message.includes("allowance") || error.message.includes("approve")) {
      throw new Error("Token approval required for swap");
    }

    throw new Error(`V3 Swap failed: ${error.message}`);
  }
};

/**
 * Exact output single swap (V3 style swap)
 */
export const exactOutputSingle = async ({
  tokenIn,
  tokenOut,
  fee,
  recipient,
  amountOut,
  amountInMaximum,
  sqrtPriceLimitX96
}: ExactOutputSingleParams): Promise<string> => {
  try {
    // Validate required parameters
    if (!ethers.isAddress(tokenIn)) {
      throw new Error("Invalid tokenIn address");
    }

    if (!ethers.isAddress(tokenOut)) {
      throw new Error("Invalid tokenOut address");
    }

    if (!recipient) {
      throw new Error("Recipient address is required");
    }

    if (!ethers.isAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    if (!amountOut || Number(amountOut) <= 0) {
      throw new Error("Amount out must be greater than 0");
    }

    if (!amountInMaximum || Number(amountInMaximum) <= 0) {
      throw new Error("Amount in maximum must be greater than 0");
    }

    // Validate fee tier
    const validFees = [500, 3000, 10000];
    if (!validFees.includes(fee)) {
      throw new Error("Invalid fee tier. Must be 500, 3000, or 10000");
    }

    const signer = getSigner();
    const provider = getProvider();

    if (!signer) {
      throw new Error("Signer not initialized");
    }

    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Convert amounts to wei
    const amountOutWei = parseEther(amountOut);
    const amountInMaximumWei = parseEther(amountInMaximum);

    // Create contract instance
    const routerContract = new ethers.Contract(
      UNIVERSAL_ROUTER_ADDRESS,
      universalRouterAbi,
      signer
    );

    // Prepare parameters
    const params = {
      tokenIn,
      tokenOut,
      fee,
      recipient,
      amountOut: amountOutWei,
      amountInMaximum: amountInMaximumWei,
      sqrtPriceLimitX96: sqrtPriceLimitX96 || "0"
    };

    console.log(`V3 Exact output swap: receive ${amountOut} ${tokenOut} from ${tokenIn}...`);

    // Execute swap
    const tx = await routerContract.exactOutputSingle(params);

    console.log(`Swap transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }

    if (receipt.status !== 1) {
      throw new Error("Swap transaction failed");
    }

    console.log(`✅ V3 Swap completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;

  } catch (error: any) {
    console.error("V3 Swap failed:", error.message);

    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for swap");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during swap");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Swap transaction timed out");
    } else if (error.message.includes("insufficient")) {
      throw new Error("Insufficient token balance for swap");
    } else if (error.message.includes("allowance") || error.message.includes("approve")) {
      throw new Error("Token approval required for swap");
    }

    throw new Error(`V3 Swap failed: ${error.message}`);
  }
};
