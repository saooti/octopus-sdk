export const selenium = {
  methods: {
    seleniumFormat(string: string) {
      return string.toLowerCase().replace(/\s/g, '');
    },
  },
};
export const cookies = {
  methods: {
    setCookie(name: string, value: any) {
      var date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
      var expires = '; expires=' + date.toUTCString();
      document.cookie = name + '=' + (value || '') + expires + '; path=/';
    },
    getCookie(name: string) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (0 === c.indexOf(nameEQ))
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
  },
};

export const displayMethods = {
  methods: {
    urlify(text: string) {
      let urlRegex = /(https?:\/\/[^\s]+)/g;
      if (!text) return '';
      return text.replace(urlRegex, (url: string) => {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
      });
    },
    async onCopyCode(link: string, callback: ()=>void) {
      if ('undefined' !== typeof navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        return callback();
      }
      let textArea = document.createElement('textarea');
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
