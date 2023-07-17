import { defineComponent } from "vue";
export default defineComponent({
  name: "TagOfMixins",
  methods: {
    isOuestFranceTag(tag: string): boolean {
      return "[of]" === tag.substring(0, 4);
    },
    formateOfTag(tag: string): string {
      if (!this.isOuestFranceTag(tag)) {
        return tag;
      }
      const lastSlash = tag.lastIndexOf("/");
      if (-1 !== lastSlash) {
        return tag.substring(lastSlash + 1, tag.length);
      }
      return tag.substring(4, tag.length);
    },
  },
});
