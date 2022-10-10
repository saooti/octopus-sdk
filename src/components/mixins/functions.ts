import { state } from '../../store/paramStore';

export const selenium ={
  methods: {
    seleniumFormat(string: string): string {
      return string.toLowerCase().replace(/\s/g, '');
    },
  },
};
export const imageProxy ={
  methods: {
    proxyImageUrl(url:string, width:string): string{
      if(!url){
        return "";
      }
      if(state.octopusApi.imageUrl && url.includes('http')){
        return state.octopusApi.imageUrl+"image/"+btoa(url)+"?width="+width+"&useWebp=true";
      }
      return url;
    },
  },
};
export const cookies =
{
  methods: {
    setCookie(name: string, value: string, domain= ""): void {
      const date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
      const expires = '; expires=' + date.toUTCString();
      document.cookie = name + '=' + (value || '') + expires +domain+ '; path=/';
    },
    getCookie(name: string): string|null {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (0 === c.indexOf(nameEQ))
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
  },
};

export const displayMethods ={
  methods: {
    urlify(text: string): string {
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      if (!text) return '';
      return text.replace(urlRegex, (url: string) => {
        return '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>';
      });
    },
    async onCopyCode(link: string, callback: () => void): Promise<void> {
      if ('undefined' !== typeof navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        return callback();
      }
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return callback();
    },
  },
};

