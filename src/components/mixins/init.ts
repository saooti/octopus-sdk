import { Category } from "@/stores/class/general/category";
import orgaFilter from "../mixins/organisationFilter";
import octopusApi from "@saooti/octopus-api";
import { state } from "../../stores/ParamSdkStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  mixins: [orgaFilter],
  methods: {
    ...mapActions(useGeneralStore, ["storedUpdateCategories"]),
    async initSdk() {
      if (
        0 === (state.generalParameters.allCategories as Array<Category>).length
      ) {
        octopusApi
          .fetchDataWithParams<Array<Category>>(
            0,
            `iab/list${
              state.octopusApi.organisationId
                ? "/" + state.octopusApi.organisationId
                : ""
            }`,
            { lang: this.$i18n.locale },
          )
          .then((data: Array<Category>) => {
            this.storedUpdateCategories(data);
          });
      } else {
        this.storedUpdateCategories(
          state.generalParameters.allCategories as Array<Category>,
        );
      }
      const captcha = document.getElementsByClassName(
        "grecaptcha-badge",
      )[0] as HTMLElement;
      if (captcha) {
        captcha.style.display = "none";
      }
    },
  },
});
