/**
 * Address validation utilities for security
 */

/**
 * Validate Ethereum address format
 * Returns true if address is a valid hex format (does not verify checksum)
 */
export function isValidEthAddress(address: string | null | undefined): boolean {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Normalize Ethereum address to lowercase
 */
export function normalizeAddress(address: string): string {
    return address.toLowerCase();
}

/**
 * Validate and normalize an Ethereum address
 * Returns null if invalid, normalized address if valid
 */
export function validateAndNormalizeAddress(
    address: string | null | undefined
): string | null {
    if (!isValidEthAddress(address)) return null;
    return normalizeAddress(address!);
}

/**
 * Validate pagination parameters
 * Returns bounded values
 */
export function validatePagination(
    page: string | null | undefined,
    limit: string | null | undefined,
    maxLimit: number = 100
): { page: number; limit: number } {
    const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
    const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit || '50', 10) || 50));

    return { page: parsedPage, limit: parsedLimit };
}
