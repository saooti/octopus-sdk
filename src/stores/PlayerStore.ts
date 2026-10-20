export interface PlayerTranscript {
    current: number;
    currentText: Array<string>;
    value: Array<{ endTime: number; startTime: number; text: Array<string> }>;
}
