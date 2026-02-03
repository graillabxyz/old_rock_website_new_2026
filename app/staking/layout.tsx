'use client';

import { StakingProvider } from '@/components/staking/staking-provider';

export default function StakingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StakingProvider>
            {children}
        </StakingProvider>
    );
}
