export default {
  convertTimestamptoSeconds(timestamp: string) {
    timestamp = "00:00:00".substring(0, 8 - timestamp.length) + timestamp;
    const [hours, minutes, seconds] = timestamp.split(":");
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  },
  formatToString(value: number) {
    if (value < 10) {
      return "0" + value;
    }
    return value.toString();
  },
  formatDuration(
    totalSeconds: number | null,
    separator = "'",
    isLast = true,
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
      this.formatToString(seconds) +
      (isLast ? separator : "")
    );
  },
};
