import { describe, it, expect } from 'vitest';
import { parseSrtTranscript } from '../../src/helper/transcriptHelper';

describe('transcriptHelper', () => {
    describe('parseSrtTranscript', () => {
        it('parses single-line chunks', () => {
            const srt = '1\n00:00:00,000 --> 00:00:02,500\nHello\n\n2\n00:00:02,500 --> 00:00:04,000\nWorld\n\n';

            expect(parseSrtTranscript(srt)).toEqual([
                { startTime: 0, endTime: 2.5, text: ['Hello'] },
                { startTime: 2.5, endTime: 4, text: ['World'] }
            ]);
        });

        it('parses a chunk spanning multiple lines', () => {
            const srt = '1\n00:00:00,000 --> 00:00:02,000\nFirst line\nSecond line\nThird line\n\n2\n00:00:02,000 --> 00:00:04,000\nNext\n\n';

            expect(parseSrtTranscript(srt)).toEqual([
                { startTime: 0, endTime: 2, text: ['First line', 'Second line', 'Third line'] },
                { startTime: 2, endTime: 4, text: ['Next'] }
            ]);
        });

        it('handles Windows line endings in multi-line chunks', () => {
            const srt = '1\r\n00:00:00,000 --> 00:00:02,000\r\nFirst line\r\nSecond line\r\n\r\n';

            expect(parseSrtTranscript(srt)).toEqual([
                { startTime: 0, endTime: 2, text: ['First line', 'Second line'] }
            ]);
        });

        it('converts hours and minutes to seconds', () => {
            const srt = '1\n01:02:03,500 --> 01:02:05,000\nHello\n\n';

            expect(parseSrtTranscript(srt)).toEqual([
                { startTime: 3723.5, endTime: 3725, text: ['Hello'] }
            ]);
        });

        it('returns an empty array for an empty transcript', () => {
            expect(parseSrtTranscript('')).toEqual([]);
        });
    });
});
