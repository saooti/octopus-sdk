import { FetchParam } from "@/stores/class/general/fetchParam";

export default {
  methods: {
    getUriSearchParams(parameters: FetchParam): URLSearchParams {
      const _return = new URLSearchParams();
      for (const [key, value] of Object.entries(parameters)) {
        // remove empty array for stats #12323
        if (undefined !== value && '' !== value && (!Array.isArray(value) || (Array.isArray(value) && value.length) )) {
          _return.append(key, value.toString());
        }
      }
      return _return;
    },
  },
};
