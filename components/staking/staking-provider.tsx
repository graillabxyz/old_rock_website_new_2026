'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import {
    RainbowKitProvider,
    darkTheme,
    lightTheme,
    getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { NETWORK, ALCHEMY_API_KEY, WALLETCONNECT_PROJECT_ID } from '@/lib/staking-constants';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [NETWORK === 'base' ? base : baseSepolia],
    [
        alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
        publicProvider(),
    ]
);

// Set up wallet connectors
const { connectors } = getDefaultWallets({
    appName: 'Old Rock Staking',
    projectId: WALLETCONNECT_PROJECT_ID,
    chains,
});

// Create wagmi config
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

interface StakingProviderProps {
    children: React.ReactNode;
}

export function StakingProvider({ children }: StakingProviderProps) {
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
                chains={chains}
                theme={{
                    lightMode: lightTheme(),
                    darkMode: darkTheme(),
                }}
                appInfo={{
                    appName: 'Old Rock Staking',
                }}
                modalSize="compact"
            >
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export { queryClient };
