export interface RankInfo {
    title: string;
    level: string;
    tier: string; // Combined title and level, e.g., "Acolyte II"
    color: string;
    icon: string;
    nextRankWins: number | null;
}

export const RANKS = {
    ACOLYTE: { title: "Acolyte", color: "#94A3B8" }, // Slate 400
    DISCIPLE: { title: "Disciple", color: "#38BDF8" }, // Blue 400
    CHAMPION: { title: "Champion", color: "#F472B6" }, // Pink 400
    ASCENDANT: { title: "Ascendant", color: "#FACC15" }, // Yellow 400
    GUARDIAN: { title: "Guardian", color: "#10B981" }, // Emerald 500
    PARAGON: { title: "Paragon", color: "#6366F1" }, // Indigo 500
};

export function getDensityDeckRank(wins: number): RankInfo {
    // Acolyte (0-69)
    if (wins <= 15) return createRank(RANKS.ACOLYTE, "I", 16);
    if (wins <= 30) return createRank(RANKS.ACOLYTE, "II", 31);
    if (wins <= 50) return createRank(RANKS.ACOLYTE, "III", 51);
    if (wins <= 69) return createRank(RANKS.ACOLYTE, "IV", 70);

    // Disciple (70-199)
    if (wins <= 100) return createRank(RANKS.DISCIPLE, "I", 101);
    if (wins <= 135) return createRank(RANKS.DISCIPLE, "II", 136);
    if (wins <= 165) return createRank(RANKS.DISCIPLE, "III", 166);
    if (wins <= 199) return createRank(RANKS.DISCIPLE, "IV", 200);

    // Champion (200-399)
    if (wins <= 235) return createRank(RANKS.CHAMPION, "I", 236);
    if (wins <= 275) return createRank(RANKS.CHAMPION, "II", 276);
    if (wins <= 315) return createRank(RANKS.CHAMPION, "III", 316);
    if (wins <= 355) return createRank(RANKS.CHAMPION, "IV", 356);
    if (wins <= 399) return createRank(RANKS.CHAMPION, "V", 400);

    // Guardian (400-799)
    if (wins <= 475) return createRank(RANKS.GUARDIAN, "I", 476);
    if (wins <= 550) return createRank(RANKS.GUARDIAN, "II", 551);
    if (wins <= 625) return createRank(RANKS.GUARDIAN, "III", 626);
    if (wins <= 700) return createRank(RANKS.GUARDIAN, "IV", 701);
    if (wins <= 799) return createRank(RANKS.GUARDIAN, "V", 800);

    // Ascendant (800-1800)
    if (wins <= 900) return createRank(RANKS.ASCENDANT, "I", 901);
    if (wins <= 1050) return createRank(RANKS.ASCENDANT, "II", 1051);
    if (wins <= 1250) return createRank(RANKS.ASCENDANT, "III", 1251);
    if (wins <= 1500) return createRank(RANKS.ASCENDANT, "IV", 1501);
    if (wins <= 1800) return createRank(RANKS.ASCENDANT, "V", 1801);

    // Paragon (1801+)
    if (wins <= 2200) return createRank(RANKS.PARAGON, "I", 2201);
    if (wins <= 2700) return createRank(RANKS.PARAGON, "II", 2701);
    if (wins <= 3300) return createRank(RANKS.PARAGON, "III", 3301);
    if (wins <= 4000) return createRank(RANKS.PARAGON, "IV", 4001);
    if (wins <= 4900) return createRank(RANKS.PARAGON, "V", 4901);
    if (wins <= 6000) return createRank(RANKS.PARAGON, "VI", 6001);
    if (wins <= 7300) return createRank(RANKS.PARAGON, "VII", 7301);
    if (wins <= 8800) return createRank(RANKS.PARAGON, "VIII", 8801);
    if (wins <= 10500) return createRank(RANKS.PARAGON, "IX", 10501);
    return createRank(RANKS.PARAGON, "X", null);
}

function createRank(rankConfig: { title: string, color: string }, level: string, nextRankWins: number | null): RankInfo {
    // Using simple descriptive icons from Lucide-like names as placeholders
    // The user will replace these with custom white webp files later
    let icon = "shield";
    if (rankConfig.title === "Disciple") icon = "shield-check";
    if (rankConfig.title === "Champion") icon = "award";
    if (rankConfig.title === "Ascendant") icon = "trophy";
    if (rankConfig.title === "Guardian") icon = "shield-check";
    if (rankConfig.title === "Paragon") icon = "crown";

    return {
        title: rankConfig.title,
        level,
        tier: `${rankConfig.title} ${level}`,
        color: rankConfig.color,
        icon,
        nextRankWins
    };
}
