'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Loader2, Link as LinkIcon, ArrowLeft, Search, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoliathNFT, OldRocksNFT } from '@/types/staking';
import { useStakingStore } from '@/lib/staking-store';

// Color map for badges
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
    WHITE: { bg: '#FFFFFF', text: '#000000' },
    SILVER: { bg: '#B3B3B3', text: '#000000' },
    YELLOW: { bg: '#FEC42A', text: '#000000' },
    GOLD: { bg: '#EDA825', text: '#000000' },
    AQUAMARINE: { bg: '#46AA9A', text: '#FFFFFF' },
    TURQUOISE: { bg: '#257875', text: '#FFFFFF' },
    BLUE: { bg: '#3182AA', text: '#FFFFFF' },
    PURPLE: { bg: '#8856B9', text: '#FFFFFF' },
    RED: { bg: '#DC4537', text: '#FFFFFF' },
    BLACK: { bg: '#404040', text: '#FFFFFF' },
    COMMON: { bg: '#808080', text: '#FFFFFF' },
    NONE: { bg: '#333333', text: '#FFFFFF' },
};

function GoliathDensityBars({ density }: { density: string }) {
    const densityUpper = density?.toUpperCase() || 'LOW';
    let bars = 0;

    if (densityUpper === 'PURE') bars = 3;
    else if (densityUpper === 'HIGH' || densityUpper === 'MYSTIC') bars = 3;
    else if (densityUpper === 'MEDIUM') bars = 2;
    else if (densityUpper === 'LOW') bars = 1;

    return (
        <div className="flex items-center gap-[3px] h-[14px]">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="w-[18px] h-full rounded-[1px]"
                    style={{
                        backgroundColor: i < bars ? (densityUpper === 'PURE' ? '#f2d94e' : '#fff') : 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        opacity: i < bars ? 1 : 0.2
                    }}
                />
            ))}
        </div>
    );
}

// Collapsible Helper Component
function CollapsibleSection({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-white/10 pt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between mb-3 group"
            >
                <span className="font-bold text-gray-300 text-sm group-hover:text-white transition-colors">{title}</span>
                {isOpen ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="space-y-2 pl-1">
                    {children}
                </div>
            )}
        </div>
    );
}

interface GoliathGalleryProps {
    goliaths: GoliathNFT[];
    selectedRock: OldRocksNFT | null;
    loadingGoliathId?: string;
    onGoliathClick: (goliath: GoliathNFT) => void;
}

export function GoliathGallery({
    goliaths,
    selectedRock,
    loadingGoliathId,
    onGoliathClick,
}: GoliathGalleryProps) {
    const { allGoliaths } = useStakingStore();
    const [selectedDensities, setSelectedDensities] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters State
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Mobile State
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Calculate Counts for Filters
    const densityCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allGoliaths.forEach(g => {
            const d = g.density?.toUpperCase() || 'UNKNOWN';
            counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [allGoliaths]);

    const colorCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allGoliaths.forEach(g => {
            const c = g.color?.toUpperCase() || 'NONE';
            counts[c] = (counts[c] || 0) + 1;
        });
        return counts;
    }, [allGoliaths]);

    const statusCounts = useMemo(() => {
        const counts = { AVAILABLE: 0, LINKED: 0, STAKED: 0 };
        allGoliaths.forEach(g => {
            if (selectedRock && g.linkedRock === selectedRock.id) counts.LINKED++;
            else if (g.linkedRock) counts.STAKED++;
            else counts.AVAILABLE++;
        });
        return counts;
    }, [allGoliaths, selectedRock]);

    // Filter/Sort Logic
    const displayGoliaths = useMemo(() => {
        let filtered = [...allGoliaths];

        // Apply Status Filter (Multiple)
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(g => {
                const isLinked = selectedRock && g.linkedRock === selectedRock.id;
                const isStaked = g.linkedRock && (!selectedRock || g.linkedRock !== selectedRock.id);
                const isAvailable = !g.linkedRock;

                if (selectedStatuses.includes('AVAILABLE') && isAvailable) return true;
                if (selectedStatuses.includes('LINKED') && isLinked) return true;
                if (selectedStatuses.includes('STAKED') && isStaked) return true;
                return false;
            });
        }

        // Apply Density filter (Multiple)
        if (selectedDensities.length > 0) {
            filtered = filtered.filter(g => selectedDensities.includes(g.density?.toUpperCase()));
        }

        // Apply Color filter (Multiple)
        if (selectedColors.length > 0) {
            filtered = filtered.filter(g => selectedColors.includes(g.color?.toUpperCase()));
        }

        // Apply Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                g.name?.toLowerCase().includes(lowerQuery) ||
                g.id?.toString().includes(lowerQuery)
            );
        }

        // Default Sort by ID
        filtered.sort((a, b) => a.id - b.id);

        return filtered;
    }, [allGoliaths, selectedStatuses, selectedDensities, selectedColors, searchQuery, selectedRock]);

    const toggleDensity = (d: string) => {
        setSelectedDensities(prev =>
            prev.includes(d) ? prev.filter(item => item !== d) : [...prev, d]
        );
    };

    const toggleColor = (c: string) => {
        setSelectedColors(prev =>
            prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
        );
    };

    const toggleStatus = (s: string) => {
        setSelectedStatuses(prev =>
            prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
        );
    };

    // Reset pagination (infinite scroll) when filters change
    useEffect(() => {
        setVisibleCount(20);
    }, [selectedDensities, selectedColors, searchQuery, selectedStatuses]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 20);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [displayGoliaths, visibleCount]); // Dependency on visibleCount prevents stale closure if needed, but mostly [displayGoliaths] reset is key. Actually if displayGoliaths changes, we reset anyway. Adding visibleCount ensures if ref moves we re-observe? No. Just displayGoliaths and initial mount.

    const visibleGoliaths = displayGoliaths.slice(0, visibleCount);

    // Calculate count and capacity
    const linkedCount = selectedRock ? allGoliaths.filter(g => g.linkedRock === selectedRock.id).length : 0;
    const isAtCapacity = selectedRock ? linkedCount >= selectedRock.maxCapacity : false;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-10 relative z-10">
            {/* MOBILE FILTER TRIGGER */}
            <div className="lg:hidden flex items-center justify-between mb-8 bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">GOLIATH INVENTORY</span>
                    <span className="text-2xl font-black text-white">{displayGoliaths.length} ITEMS</span>
                </div>
                <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                >
                    <Search className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">FILTER</span>
                </button>
            </div>

            <div className="flex gap-8 items-start">

                {/* LEFT SIDEBAR FILTERS (Desktop) */}
                <div className="hidden lg:block w-[280px] shrink-0 sticky top-24 space-y-2">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-white text-lg">Filters</span>
                        <ArrowLeft className="w-4 h-4 text-white/40 rotate-90" />
                    </div>

                    {/* Collapsible Sections */}
                    <div className="space-y-4">

                        {/* Search */}
                        <div className="border-t border-white/10 pt-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search by ID or Name..."
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <CollapsibleSection title="Status">
                            <div className="space-y-2">
                                {['AVAILABLE', 'LINKED', 'STAKED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => toggleStatus(status)}
                                        className="w-full flex items-center justify-between group py-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                selectedStatuses.includes(status) ? "bg-blue-500 border-blue-500" : "border-white/20 group-hover:border-white/40"
                                            )}>
                                                {selectedStatuses.includes(status) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="font-medium text-white/60 group-hover:text-white transition-colors capitalize text-sm">
                                                {status === 'STAKED' ? 'Busy' : status.toLowerCase()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-white/20">{statusCounts[status as keyof typeof statusCounts] || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Density Filter */}
                        <CollapsibleSection title="Density">
                            <div className="space-y-2">
                                {['COMMON', 'LOW', 'MEDIUM', 'HIGH', 'MYSTIC'].map(density => (
                                    <button
                                        key={density}
                                        onClick={() => toggleDensity(density)}
                                        className="w-full flex items-center justify-between group py-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                selectedDensities.includes(density) ? "bg-blue-500 border-blue-500" : "border-white/20 group-hover:border-white/40"
                                            )}>
                                                {selectedDensities.includes(density) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="font-medium text-white/60 group-hover:text-white transition-colors capitalize text-sm">{density.toLowerCase()}</span>
                                        </div>
                                        <span className="text-xs text-white/20">{densityCounts[density] || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Color Filter */}
                        <CollapsibleSection title="Color">
                            <div className="space-y-2">
                                {Object.keys(COLOR_MAP).filter(c => c !== 'NONE' && c !== 'COMMON').map(color => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className="w-full flex items-center justify-between group py-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                selectedColors.includes(color) ? "bg-blue-500 border-blue-500" : "border-white/20 group-hover:border-white/40"
                                            )}>
                                                {selectedColors.includes(color) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLOR_MAP[color]?.bg }}
                                            />
                                            <span className="font-medium text-white/60 group-hover:text-white transition-colors capitalize text-sm">{color.toLowerCase()}</span>
                                        </div>
                                        <span className="text-xs text-white/20">{colorCounts[color] || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </CollapsibleSection>

                    </div>
                </div>

                {/* MOBILE FILTER DRAWER */}
                {isFilterDrawerOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsFilterDrawerOpen(false)}
                        />
                        {/* Drawer Content */}
                        <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-[#0d141a] rounded-t-[30px] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300">
                            {/* Drawer Cap/Handle */}
                            <div className="flex flex-col items-center py-4 shrink-0">
                                <div className="w-12 h-1 bg-white/20 rounded-full mb-4" />
                                <div className="w-full px-6 flex items-center justify-between">
                                    <span className="text-xl font-black text-white">FILTERS</span>
                                    <button
                                        onClick={() => setIsFilterDrawerOpen(false)}
                                        className="text-white/40 font-bold uppercase text-[10px] tracking-widest"
                                    >
                                        DONE
                                    </button>
                                </div>
                            </div>

                            {/* Options Scroll Area */}
                            <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-6">
                                {/* Search */}
                                <div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID or Name..."
                                            className="w-full bg-gray-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <CollapsibleSection title="Status">
                                    <div className="space-y-2">
                                        {['AVAILABLE', 'LINKED', 'STAKED'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => toggleStatus(status)}
                                                className="w-full flex items-center justify-between group py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                                        selectedStatuses.includes(status) ? "bg-blue-500 border-blue-500" : "border-white/20"
                                                    )}>
                                                        {selectedStatuses.includes(status) && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className="font-bold text-white transition-colors capitalize">
                                                        {status === 'STAKED' ? 'Busy' : status.toLowerCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-white/20">{statusCounts[status as keyof typeof statusCounts] || 0}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CollapsibleSection>

                                {/* Density Filter */}
                                <CollapsibleSection title="Density">
                                    <div className="space-y-2">
                                        {['COMMON', 'LOW', 'MEDIUM', 'HIGH', 'MYSTIC'].map(density => (
                                            <button
                                                key={density}
                                                onClick={() => toggleDensity(density)}
                                                className="w-full flex items-center justify-between group py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                                        selectedDensities.includes(density) ? "bg-blue-500 border-blue-500" : "border-white/20"
                                                    )}>
                                                        {selectedDensities.includes(density) && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className="font-bold text-white transition-colors capitalize">{density.toLowerCase()}</span>
                                                </div>
                                                <span className="text-xs text-white/20">{densityCounts[density] || 0}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CollapsibleSection>

                                {/* Color Filter */}
                                <CollapsibleSection title="Color">
                                    <div className="space-y-2 pb-6">
                                        {Object.keys(COLOR_MAP).filter(c => c !== 'NONE' && c !== 'COMMON').map(color => (
                                            <button
                                                key={color}
                                                onClick={() => toggleColor(color)}
                                                className="w-full flex items-center justify-between group py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                                        selectedColors.includes(color) ? "bg-blue-500 border-blue-500" : "border-white/20"
                                                    )}>
                                                        {selectedColors.includes(color) && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: COLOR_MAP[color]?.bg }}
                                                    />
                                                    <span className="font-bold text-white transition-colors capitalize">{color.toLowerCase()}</span>
                                                </div>
                                                <span className="text-xs text-white/20">{colorCounts[color] || 0}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT GRID */}
                <div className="flex-1 min-h-[500px]">

                    {/* Top Control Bar (Desktop Only) */}
                    <div className="hidden lg:flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-white">{displayGoliaths.length} ITEMS</span>

                            {/* Clear Filters */}
                            {(selectedDensities.length > 0 || selectedColors.length > 0 || selectedStatuses.length > 0 || searchQuery) && (
                                <button
                                    onClick={() => { setSelectedDensities([]); setSelectedColors([]); setSelectedStatuses([]); setSearchQuery(''); }}
                                    className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Infinite Scroll Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {visibleGoliaths.map((goliath) => {
                            const isLinked = selectedRock && goliath.linkedRock === selectedRock.id;
                            const isLinkedElsewhere = goliath.linkedRock && (!selectedRock || goliath.linkedRock !== selectedRock.id);

                            // Visual helpers
                            const colorData = COLOR_MAP[goliath.color?.toUpperCase()] || COLOR_MAP.NONE;

                            return (
                                <div
                                    key={goliath.id}
                                    className={cn(
                                        "relative group rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer bg-[#0d141a]",
                                        isLinked ? "border-[#6BC482] shadow-[0_0_20px_rgba(107,196,130,0.2)]" : "border-white/10 hover:border-white/30",
                                        isLinkedElsewhere ? "opacity-50 grayscale" : "opacity-100"
                                    )}
                                >
                                    {/* Image Aspect Ratio */}
                                    <div className="aspect-square relative">
                                        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                                            {/* Removed duplicate ID badge, kept Density */}
                                            <span className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                                                {goliath.density}
                                            </span>
                                        </div>

                                        {/* Status Indicator overlapping image bottom */}
                                        {isLinked && (
                                            <div className="absolute inset-x-0 bottom-0 bg-[#6BC482]/90 py-1 flex items-center justify-center backdrop-blur-sm z-10">
                                                <span className="text-[10px] font-black text-black uppercase tracking-wider">LINKED</span>
                                            </div>
                                        )}
                                        {isLinkedElsewhere && (
                                            <div className="absolute inset-x-0 bottom-0 bg-red-500/90 py-1 flex items-center justify-center backdrop-blur-sm z-10 group/status">
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider group-hover/status:hidden">CONNECTED</span>
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider hidden group-hover/status:inline">ROCK #{goliath.linkedRock}</span>
                                            </div>
                                        )}

                                        <img
                                            src={goliath.imageId?.replace('.webp', '-300.webp')}
                                            alt={goliath.name}
                                            className="w-full h-full object-cover transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="p-3 bg-black/40 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div
                                                className="w-3 h-3 rounded-full border border-white/20"
                                                style={{ backgroundColor: colorData.bg }}
                                                title={goliath.color}
                                            />
                                            <span className="text-[10px] text-white/40 font-bold max-w-[80px] truncate">
                                                {goliath.name}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onGoliathClick(goliath); }}
                                            disabled={loadingGoliathId === goliath.id?.toString() || !!(isAtCapacity && !isLinked) || !!isLinkedElsewhere}
                                            className={cn(
                                                "w-full py-2 rounded text-[10px] font-black uppercase tracking-wider transition-all",
                                                loadingGoliathId === goliath.id?.toString()
                                                    ? "bg-white/10 text-white/40 cursor-wait"
                                                    : isLinked
                                                        ? "bg-[#DC4537] text-white hover:bg-[#DC4537]/80"
                                                        : isLinkedElsewhere
                                                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                                                            : isAtCapacity
                                                                ? "bg-white/5 text-white/20 cursor-not-allowed"
                                                                : "bg-[#6BC482] text-black hover:bg-[#6BC482]/80"
                                            )}
                                        >
                                            {loadingGoliathId === goliath.id?.toString() ? (
                                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                            ) : isLinked ? (
                                                "DISCONNECT"
                                            ) : isLinkedElsewhere ? (
                                                "STAKED"
                                            ) : isAtCapacity ? (
                                                "ROCK IS FULL"
                                            ) : (
                                                "CONNECT"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Infinite Scroll Sentinel */}
                    <div ref={loadMoreRef} className="w-full py-8 flex items-center justify-center">
                        {(visibleCount < displayGoliaths.length) && (
                            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
