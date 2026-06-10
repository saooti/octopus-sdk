/**
 * Get a color from a string.
 * Using the same string, the color will always be the same.
 *
 * Uses FNV-1a hashing (XOR-then-multiply with the FNV prime 16777619) for strong
 * bit avalanche: a single character difference propagates through all hash bits,
 * so similar strings produce very different hues.
 *
 * @param str The string used for the color
 * @param saturation Saturation of the color
 * @param lightness Lightness of the color
 * @returns A color
 */
export function colorFromString(str: string, saturation = 80, lightness = 70) {
    let hash = 2166136261;
    for (const char of str) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    const hue = Math.round((hash / 0xFFFFFFFF) * 360);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
