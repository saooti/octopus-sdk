export default {
  formatDuration(totalSeconds: number) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    var seconds = totalSeconds - hours * 3600 - minutes * 60;
    var hoursString = "";
    var minutesString = "";
    var secondsString = "";

    if (hours > 0) {
      if (hours < 10) {
        hoursString = '0' + hours;
      }
      if (minutes < 10) {
        minutesString = '0' + minutes;
      }
      if (seconds < 10) {
        secondsString = '0' + seconds;
      }

      return hoursString + "'" + minutesString + "'" + secondsString + "'";
    } else {
      if (minutes < 10) {
        minutesString = '0' + minutes;
      }
      if (seconds < 10) {
        secondsString = '0' + seconds;
      }

      return minutesString + "'" + secondsString + "'";
    }
  },
};
