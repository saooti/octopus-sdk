export default {
  methods: {
    urlify(text: string): string {
      const urlRegex = /[^"](https?:\/\/[^\s<]+)/g;
      if (!text) return "";
      return text.replace(urlRegex, (url: string) => {
        return (
          '<a href="' + url + '" target="_blank" rel="noopener">' + url + "</a>"
        );
      });
    },
    async onCopyCode(link: string, callback: () => void): Promise<void> {
      await navigator.clipboard.writeText(link);
      return callback();
    },
  },
};
