// Staking Types - migrated from old-rock-amplify-client

export type OldRocksNFT = {
    id: number;
    name: string;
    density: "COMMON" | "LOW" | "MEDIUM" | "HIGH" | "PURE";
    color: string;
    isPure: boolean;
    isReactive: boolean;
    imageId: string;
    dailyReward: number;
    maxCapacity: number;
    linkedGoliaths: LinkedGoliath[] | null;
};

export type GoliathNFT = {
    id: number;
    name: string;
    density: GoliathDensities;
    color: GoliathColors;
    imageId: string;
    linkedRock: number | null;
    status?: GoliathStatuses;
};

export type GoliathStatuses =
    | "linked"
    | "linking"
    | "unlinking"
    | "failed"
    | "moving"
    | "checking"
    | "free";

export type LinkedGoliath = {
    id: number;
    baseDailyReward: number;
    effectBonus: number;
    colorMatchBonus: number;
    totalDailyReward: number;
};

export type InvalidatedGoliath = {
    goliath: GoliathNFT;
    rockId: number;
    overrideRock: number | null;
    action: "link" | "unlink" | "moving";
    hash: string;
};

export type GoliathDensities = "COMMON" | "LOW" | "MEDIUM" | "HIGH" | "MYSTIC";

export type GoliathColors =
    | "NONE"
    | "WHITE"
    | "SILVER"
    | "YELLOW"
    | "GOLD"
    | "AQUAMARINE"
    | "TURQUOISE"
    | "BLUE"
    | "PURPLE"
    | "RED"
    | "BLACK";

// API Response types
export interface NFTsResponse {
    Goliath: GoliathNFT[];
    OldRocks: OldRocksNFT[];
    TotalDailyReward: number;
}

export interface DensityResponse {
    amount: number;
    amountAllocated: number;
    amountLocked: number;
    fees: number;
}

export interface CooldownResponse {
    cooldownUntil: number;
    formattedCooldownUntil: string;
}
