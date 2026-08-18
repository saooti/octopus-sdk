/** Mock function for localisation */
export function localisation(str: string, options?: Record<string,string>): string {
    let result = str;
    if (options) {
        Object.entries(options).forEach(([key, value]) => {
            result += ` ${key}:${value}`;
        });
    }
    return result;
}
