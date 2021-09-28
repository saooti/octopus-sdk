import { defineComponent } from 'vue'
export default defineComponent({
  formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    let hoursString = "";
    let minutesString = "";
    let secondsString = "";

    if (hours > 0) {
      if (hours < 10) {
        hoursString = '0' + hours;
      }else{
        hoursString = hours.toString();
      }
      if (minutes < 10) {
        minutesString = '0' + minutes;
      }else{
        minutesString = minutes.toString();
      }
      if (seconds < 10) {
        secondsString = '0' + seconds;
      }else{
        secondsString = seconds.toString();
      }

      return hoursString + "'" + minutesString + "'" + secondsString + "'";
    } else {
      if (minutes < 10) {
        minutesString = '0' + minutes;
      }else{
        minutesString = minutes.toString();
      }
      if (seconds < 10) {
        secondsString = '0' + seconds;
      }else{
        secondsString = seconds.toString();
      }

      return minutesString + "'" + secondsString + "'";
    }
  },
};