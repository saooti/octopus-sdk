import { Category } from "@/stores/class/general/category";
import orgaFilter from "../mixins/organisationFilter";
import classicApi from "../../api/classicApi";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  mixins: [orgaFilter],
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
  },
  methods: {
    ...mapActions(useGeneralStore, ["storedUpdateCategories"]),
    async initSdk() {
      classicApi.fetchData<Array<Category>>({
        api: 0,
        path:`iab/list${this.authOrgaId ? "/" + this.authOrgaId : ""}`,
        parameters:{ lang: this.$i18n.locale },
      })
      .then((data: Array<Category>) => {
        this.storedUpdateCategories(data);
      });
      const captcha = document.getElementsByClassName(
        "grecaptcha-badge",
      )[0] as HTMLElement;
      if (captcha) {
        captcha.style.display = "none";
      }
    },
  },
});
