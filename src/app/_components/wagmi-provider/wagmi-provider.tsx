'use client';

import React from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';

// https://github.com/klaytn/awesome-klaytn
// https://wagmi.sh/react/getting-started
// https://wagmi.sh/examples/connect-wallet
// https://docs.walletconnect.com/web3modal/nextjs/about

// Custom klaytn testnet
const klaytnTestnet = {
	id: 1_001,
	name: 'Klaytn Testnet',
	network: 'klaytn',
	nativeCurrency: {
		decimals: 18,
		name: 'Klaytn',
		symbol: 'KLAY',
	},
	rpcUrls: {
		default: { http: ['https://public-en-baobab.klaytn.net/'] },
		public: { http: ['https://public-en-baobab.klaytn.net/'] },
	},
	blockExplorers: {
		etherscan: { name: 'KlaytnScope', url: 'https://baobab.scope.klaytn.com/' },
		default: { name: 'KlaytnScope', url: 'https://baobab.scope.klaytn.com/' },
	},
} as const satisfies Chain;

// Configure chains & providers with the Alchemy provider
const { chains, publicClient, webSocketPublicClient } = configureChains([klaytnTestnet], [publicProvider()]);

// Set up wagmi config
const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: [new MetaMaskConnector({ chains })],
	publicClient,
	webSocketPublicClient,
});

export const WagmiProvider = function WagmiProvider({ children }: React.PropsWithChildren) {
	// Prevent nextjs 13 hydratation problem
	// https://github.com/wagmi-dev/create-wagmi/blob/main/templates/next/default/src/app/providers.tsx
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);

	return <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>;
};
