import { defineChain } from "viem";

// Arc Testnet chain — exported for use in components
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: [`https://rpc.testnet.arc.network`] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

// Arc Testnet ERC-20 contract addresses
export const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  USDC:   "0x3600000000000000000000000000000000000000",
  EURC:   "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  cirBTC: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF",
};

// Supported token aliases for Arc Testnet
export const ARC_TOKENS = [
  { symbol: "USDC",   name: "USD Coin",      decimals: 6,  logoUrl: "https://assets.coingecko.com/coins/images/6319/large/usdc.png" },
  { symbol: "EURC",   name: "Euro Coin",      decimals: 6,  logoUrl: "https://assets.coingecko.com/coins/images/26045/large/euro-coin.png" },
  { symbol: "cirBTC", name: "Circle Bitcoin", decimals: 8,  logoUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { symbol: "NATIVE", name: "Native USDC",    decimals: 18, logoUrl: "https://assets.coingecko.com/coins/images/6319/large/usdc.png" },
] as const;

export type ArcTokenSymbol = typeof ARC_TOKENS[number]["symbol"];

// Swap tokens (no NATIVE)
export const SWAP_TOKENS = ARC_TOKENS.filter(t => t.symbol !== "NATIVE").map(t => ({ ...t }));

// Bridge supported chains (testnet)
export const BRIDGE_CHAINS = [
  { id: "Arc_Testnet",      name: "Arc Testnet",      chainId: 5042002,  logoUrl: "https://testnet.arcscan.app/favicon.ico" },
  { id: "Ethereum_Sepolia", name: "Ethereum Sepolia", chainId: 11155111, logoUrl: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "Base_Sepolia",     name: "Base Sepolia",     chainId: 84532,    logoUrl: "https://assets.coingecko.com/coins/images/35110/large/symbol_transparent.png" },
  { id: "Arbitrum_Sepolia", name: "Arbitrum Sepolia", chainId: 421614,   logoUrl: "https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg" },
  { id: "Optimism_Sepolia", name: "OP Sepolia",       chainId: 11155420, logoUrl: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png" },
] as const;

export type BridgeChainId = typeof BRIDGE_CHAINS[number]["id"];
