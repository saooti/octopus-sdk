const REGEX_URL = /[^">](https?:\/\/[^\s<]+)/g;
const REGEX_A = /<a (.+?)>/g;

export default {
  urlify(text: string|undefined): string {
    if (!text) {
      return "";
    }

    // Add target="_blank" to <a>
    const withTarget = text.replace(REGEX_A, (full: string, content: string) => {
      if (full.includes('target="_blank"')) {
        return full;
      } else {
        return '<a ' + content + ' target="_blank">';
      }
    });

    // Convert URL to <a>
    return withTarget.replace(REGEX_URL, (url: string) => {
      return (
        '<a href="' + url + '" target="_blank" rel="noreferrer noopener" :title="t(\'New window\', {text: '+url+'})">' + url + "</a>"
      );
    });
  },
  async onCopyCode(link: string, callback: () => void): Promise<void> {
    await navigator.clipboard.writeText(link);
    return callback();
  },
};
