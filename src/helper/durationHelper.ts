
const TIMESTAMP_REGEX = /(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)(?:.(\d{3}))?$/;

/**
 * Convert a timestamp to seconds
 */
function convertTimestamptoSeconds(timestamp: string): number|null {
    const matches = timestamp.match(TIMESTAMP_REGEX);
    if (matches) {
        const [, hours, minutes, seconds, nanoseconds] = matches;
        return Number(hours ?? 0) * 60 * 60 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0) + Number(nanoseconds ?? 0) / 1000;
    } else {
        return null;
    }
}

function formatToString(value: number) {
    if (value < 10) {
        return "0" + value;
    }
    return value.toString();
}

function formatDuration(
    totalSeconds: number | null,
    separator = ":",
    isLast = false,
): string {
    if (null === totalSeconds) {
        return "00:00";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return (
        (hours > 0 ? this.formatToString(hours) + separator : "") +
        this.formatToString(minutes) +
        separator +
        this.formatToString(seconds.toFixed(2)) +
        (isLast ? separator : "")
    );
}

export default {
    TIMESTAMP_REGEX,

    convertTimestamptoSeconds,
    formatDuration,
    formatToString
}