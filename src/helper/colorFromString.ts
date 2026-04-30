/**
 * Get a color from a string.
 * Using the same string, the color will always be the same.
 * @param str The string used for the color
 * @param saturation Saturation of the color
 * @param lightness Lightness of the color
 * @returns A color
 */
export function colorFromString(str: string, saturation = 80, lightness = 70) {
    let hash = 0;
    str.split('').forEach(char => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    return `hsl(${(hash + 360) % 360}, ${saturation}%, ${lightness}%)`;
}
