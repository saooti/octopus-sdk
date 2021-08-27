
import Vue from "vue";
export const selenium = Vue.extend({
  methods: {
    seleniumFormat(string: string) {
      return string.toLowerCase().replace(/\s/g, '');
    },
  },
});
export const cookies = Vue.extend(
{
  methods: {
    setCookie(name: string, value: string, domain= "") {
      const date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
      const expires = '; expires=' + date.toUTCString();
      document.cookie = name + '=' + (value || '') + expires +domain+ '; path=/';
    },
    getCookie(name: string) {
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
});

export const displayMethods =Vue.extend({
  methods: {
    urlify(text: string) {
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      if (!text) return '';
      return text.replace(urlRegex, (url: string) => {
        return '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>';
      });
    },
    async onCopyCode(link: string, callback: () => void) {
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
});

export const cookiesAndMethods = displayMethods.extend(
  {
    methods: {
      setCookie(name: string, value: string, domain = "") {
        const date = new Date();
        date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
        const expires = '; expires=' + date.toUTCString();
        document.cookie = name + '=' + (value || '') + expires +domain+ '; path=/';
      },
      getCookie(name: string) {
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
  });

export const seleniumAndMethods = displayMethods.extend(
  {
    methods: {
      seleniumFormat(string: string) {
        return string.toLowerCase().replace(/\s/g, '');
      },
    },
  });