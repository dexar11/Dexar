import { createConfig, http } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "@/lib/arc-kit";
import {
  rabbyWallet,
  metaMaskWallet,
  phantomWallet,
  coinbaseWallet,
  rainbowWallet,
  okxWallet,
  trustWallet,
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

// Arc Testnet chain definition
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [rabbyWallet, metaMaskWallet, phantomWallet],
    },
    {
      groupName: "Browser Wallets",
      wallets: [injectedWallet, trustWallet, okxWallet],
    },
    {
      groupName: "Other",
      wallets: [coinbaseWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Arbi",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "117d218ca17f98367cccc7efcaf3dcc3",
  },
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: {
    [arcTestnet.id]: http(`https://rpc.testnet.arc.network`),
  },
  ssr: true,
});
