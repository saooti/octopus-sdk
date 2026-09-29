const SRT_PARSE_PATTERN = /(\d+)\n([\d:,]+)\s+-->\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/g;

interface ParsedStrSection {
    startTime: number;
    endTime: number;
    text: Array<string>;
}

function srtTimeToSeconds(time: string): number {
    const a = time.replace(',', '.').split(":").map(parseFloat);
    return a[0] * 60 * 60 + a[1] * 60 + a[2];
}

export function parseSrtTranscript(transcript: string): Array<ParsedStrSection> {
    const result: Array<ParsedStrSection> = [];
    transcript = transcript.replace(/\r\n|\r|\n|\t/g, "\n");
    let matches: RegExpExecArray;
    while ((matches = SRT_PARSE_PATTERN.exec(transcript)) != null) {
        const text = matches[4].split('\n');
        result.push({
            startTime: srtTimeToSeconds(matches[2]),
            endTime: srtTimeToSeconds(matches[3]),
            text
        });
    }

    return result;
}
