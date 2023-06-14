export default {
  formatToString(value: number){
    if (value < 10) {
      return '0' + value;
    }
    return value.toString();
  },
  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return (hours > 0? this.formatToString(hours)+"'":"") + this.formatToString(minutes) +"'"+ this.formatToString(seconds)+"''";
  },
};