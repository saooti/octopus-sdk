export default {
  convertTimestamptoSeconds(timestamp: string){
    const count = (/:/g.exec(timestamp) || []).length;
    if(0 === count){
      return 0;
    }
    if(count<2){
      timestamp = "0:"+timestamp;
    }
    const [hours, minutes, seconds] = timestamp.split(':');
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  },
  formatToString(value: number) {
    if (value < 10) {
      return "0" + value;
    }
    return value.toString();
  },
  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return (
      (hours > 0 ? this.formatToString(hours) + "'" : "") +
      this.formatToString(minutes) +
      "'" +
      this.formatToString(seconds) +
      "''"
    );
  },
};
