export default {
  methods: {
    seleniumFormat(string: string): string {
      return string.toLowerCase().replace(/\s/g, '');
    },
  },
};