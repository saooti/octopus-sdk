<template>
  <section v-if="!isLoading && !isGarRole && (authOrgaId || !noSharing)" id="share-buttons-podcast-section" class="module-box">
    <h3 class="mb-2">
      {{ $t("Share in one click") }}
    </h3>
    <div class="d-flex align-items-center">
      <template v-for="button in arrayShareButtons" :key="button.title">
        <a
          v-if="button.condition"
          rel="noreferrer noopener"
          target="_blank"
          :href="button.url"
          class="btn share-btn mb-2 text-dark me-2"
          :title="$t('New window', {text: button.title})"
        >
          <component :is="button.icon" :size="34" />
        </a>
      </template>
      <slot name="additional-buttons"/>
    </div>
  </section>
</template>

<script lang="ts">
import XIcon from "../../icons/XIcon.vue";
import BlueSkyIcon from "../../icons/BlueSkyIcon.vue";
import WhatsappIcon from "vue-material-design-icons/Whatsapp.vue";
import LinkedinIcon from "vue-material-design-icons/Linkedin.vue";
import FacebookIcon from "vue-material-design-icons/Facebook.vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "../../../stores/AuthStore";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    FacebookIcon,
    LinkedinIcon,
    WhatsappIcon,
    XIcon,
    BlueSkyIcon
  },
  props: {
    organisationId: { default: undefined, type: String },
  },
  data() {
    return {
      noSharing: true as boolean,
      isLoading: true as boolean,
    };
  },
  computed: {
    ...mapState(useAuthStore, [
      "isGarRole",
      "authOrgaId"
    ]),
    arrayShareButtons() {
      return [
        {
          title: "Facebook",
          icon: "FacebookIcon",
          url: `https://www.facebook.com/sharer/sharer.php?u=${this.urlPage}`,
          condition: true,
        },
        {
          title: "X",
          icon: "XIcon",
          url: `https://twitter.com/intent/tweet?text=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Linkedin",
          icon: "LinkedinIcon",
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Bluesky",
          icon: "BlueSkyIcon",
          url: `https://bsky.app/intent/compose?text=${this.urlPage}`,
          condition: true,
        },
        {
          title: "Whatsapp",
          icon: "WhatsappIcon",
          url: `whatsapp://send?text=${this.urlPage}`,
          condition: window.matchMedia("(hover: none)").matches,
        },
      ];
    },
    urlPage(): string {
      return window.location.href;
    },
  },
  created() {
    this.initShareButtons();
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaAttributes"]),
    async initShareButtons() {
      if (!this.organisationId) {
        return;
      }
      const attributes = await this.getOrgaAttributes(this.organisationId);
      this.noSharing = "true" === attributes.noSharing;
      this.isLoading = false;
    },
  },
});
</script>