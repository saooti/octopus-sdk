export default {
  urlify(text: string|undefined): string {
    const urlRegex = /[^">](https?:\/\/[^\s<]+)/g;
    if (!text) return "";
    return text.replace(urlRegex, (url: string) => {
      return (
        '<a href="' + url + '" target="_blank" rel="noreferrer noopener" :title="$t(\'New window\', {text: '+url+'})">' + url + "</a>"
      );
    });
  },
  async onCopyCode(link: string, callback: () => void): Promise<void> {
    await navigator.clipboard.writeText(link);
    return callback();
  },
};