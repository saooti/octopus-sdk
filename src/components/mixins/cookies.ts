import { isServer } from '../../helper/environment';
export default {
  methods: {
    setCookie(name: string, value: string, domain = ""): void {
      if(isServer){return;}
      const date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
      const expires = "; expires=" + date.toUTCString();
      document.cookie =
        name + "=" + (value || "") + expires + domain + "; path=/";
    },
    getCookie(name: string): string | null {
      if(isServer){return null;}
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (const cookieValue of ca) {
        let c = cookieValue;
        while (c.startsWith(" ")) c = c.substring(1, c.length);
        if (0 === c.indexOf(nameEQ))
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
  },
};
