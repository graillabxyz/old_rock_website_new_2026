'use client';

import React, { useState } from 'react';
import { ChevronDown, X, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoliathDensities, GoliathColors } from '@/types/staking';

const DENSITY_OPTIONS: GoliathDensities[] = ['COMMON', 'LOW', 'MEDIUM', 'HIGH', 'MYSTIC'];
const COLOR_OPTIONS: GoliathColors[] = [
    'WHITE', 'SILVER', 'YELLOW', 'GOLD', 'AQUAMARINE',
    'TURQUOISE', 'BLUE', 'PURPLE', 'RED', 'BLACK'
];

interface FilterState {
    densities: GoliathDensities[];
    colors: GoliathColors[];
}

interface SortState {
    density: 'asc' | 'desc' | null;
    color: 'asc' | 'desc' | null;
}

interface FilterSortControlsProps {
    filterby: FilterState;
    sortby: SortState;
    onFilter: (filter: FilterState) => void;
    onSort: (sort: SortState) => void;
    onClear: () => void;
}

export function FilterSortControls({
    filterby,
    sortby,
    onFilter,
    onSort,
    onClear,
}: FilterSortControlsProps) {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const hasActiveFilters = filterby.densities.length > 0 || filterby.colors.length > 0;
    const hasActiveSort = sortby.density !== null || sortby.color !== null;

    const toggleDensityFilter = (density: GoliathDensities) => {
        const newDensities = filterby.densities.includes(density)
            ? filterby.densities.filter(d => d !== density)
            : [...filterby.densities, density];
        onFilter({ ...filterby, densities: newDensities });
    };

    const toggleColorFilter = (color: GoliathColors) => {
        const newColors = filterby.colors.includes(color)
            ? filterby.colors.filter(c => c !== color)
            : [...filterby.colors, color];
        onFilter({ ...filterby, colors: newColors });
    };

    const toggleSort = (key: 'density' | 'color') => {
        const currentValue = sortby[key];
        const newValue = currentValue === null ? 'asc' : currentValue === 'asc' ? 'desc' : null;
        onSort({ ...sortby, [key]: newValue });
    };

    return (
        <div className="flex items-center gap-2">
            {/* Filter Button & Dropdown */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowFilterDropdown(!showFilterDropdown);
                        setShowSortDropdown(false);
                    }}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                        'bg-gray-800 hover:bg-gray-700 border border-gray-700',
                        hasActiveFilters && 'border-purple-500 bg-purple-900/20'
                    )}
                >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filter</span>
                    {hasActiveFilters && (
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-xs flex items-center justify-center">
                            {filterby.densities.length + filterby.colors.length}
                        </span>
                    )}
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showFilterDropdown && 'rotate-180')} />
                </button>

                {showFilterDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4">
                        {/* Density Filters */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 uppercase mb-2">Density</div>
                            <div className="flex flex-wrap gap-1">
                                {DENSITY_OPTIONS.map(density => (
                                    <button
                                        key={density}
                                        onClick={() => toggleDensityFilter(density)}
                                        className={cn(
                                            'px-2 py-1 text-xs rounded transition-colors',
                                            filterby.densities.includes(density)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        )}
                                    >
                                        {density}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Filters */}
                        <div>
                            <div className="text-xs text-gray-400 uppercase mb-2">Color</div>
                            <div className="flex flex-wrap gap-1">
                                {COLOR_OPTIONS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColorFilter(color)}
                                        className={cn(
                                            'px-2 py-1 text-xs rounded transition-colors',
                                            filterby.colors.includes(color)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        )}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sort Button & Dropdown */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowFilterDropdown(false);
                    }}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                        'bg-gray-800 hover:bg-gray-700 border border-gray-700',
                        hasActiveSort && 'border-blue-500 bg-blue-900/20'
                    )}
                >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-sm">Sort</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showSortDropdown && 'rotate-180')} />
                </button>

                {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-2">
                        <button
                            onClick={() => toggleSort('density')}
                            className={cn(
                                'w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors',
                                sortby.density ? 'bg-blue-900/30 text-blue-400' : 'hover:bg-gray-800'
                            )}
                        >
                            <span>By Density</span>
                            {sortby.density && (
                                <span className="text-xs uppercase">{sortby.density}</span>
                            )}
                        </button>
                        <button
                            onClick={() => toggleSort('color')}
                            className={cn(
                                'w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors',
                                sortby.color ? 'bg-blue-900/30 text-blue-400' : 'hover:bg-gray-800'
                            )}
                        >
                            <span>By Color</span>
                            {sortby.color && (
                                <span className="text-xs uppercase">{sortby.color}</span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Clear Button */}
            {(hasActiveFilters || hasActiveSort) && (
                <button
                    onClick={onClear}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                    Clear
                </button>
            )}
        </div>
    );
}

// Utility function to apply filters and sorting
export function applyFilters({
    goliaths,
    filterby,
    sortby,
    isAssociated,
    selectedRock,
}: {
    goliaths: any[];
    filterby: FilterState;
    sortby: SortState;
    isAssociated: boolean;
    selectedRock: any;
}) {
    let filtered = [...goliaths];

    // Filter by association
    if (isAssociated && selectedRock) {
        filtered = filtered.filter(g => g.linkedRock === selectedRock.id);
    }

    // Filter by density
    if (filterby.densities.length > 0) {
        filtered = filtered.filter(g => filterby.densities.includes(g.density));
    }

    // Filter by color
    if (filterby.colors.length > 0) {
        filtered = filtered.filter(g => filterby.colors.includes(g.color));
    }

    // Sort by density
    if (sortby.density) {
        const densityOrder = ['COMMON', 'LOW', 'MEDIUM', 'HIGH', 'MYSTIC'];
        filtered.sort((a, b) => {
            const aIndex = densityOrder.indexOf(a.density);
            const bIndex = densityOrder.indexOf(b.density);
            return sortby.density === 'asc' ? aIndex - bIndex : bIndex - aIndex;
        });
    }

    // Sort by color
    if (sortby.color) {
        filtered.sort((a, b) => {
            const comparison = a.color.localeCompare(b.color);
            return sortby.color === 'asc' ? comparison : -comparison;
        });
    }

    return filtered;
}
