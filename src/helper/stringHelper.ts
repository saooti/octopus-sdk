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
  uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  },
};
