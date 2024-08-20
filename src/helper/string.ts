export default {
  trimChar(string: string, charToRemove: string): string {
    while (string.startsWith(charToRemove)) {
      string = string.substring(1);
    }

    while (string.endsWith(charToRemove)) {
      string = string.substring(0, string.length - 1);
    }

    return string;
  },
};
