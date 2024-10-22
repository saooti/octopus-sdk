<template>
  <div class="module-box">
    <h2 class="mb-3">
      {{ $t("Distribute") }}
    </h2>
    <div class="sharing-distribution-container">
      {{ $t("Rss feed:") }}
      <div class="text-primary hide-small-screen text-break">
        {{ rss }}
      </div>
      <input
        type="button"
        :value="$t('Copy')"
        class="btn btn-primary"
        :title="$t('Copy')"
        @click="onCopyCode(rss, afterCopy)"
      />
    </div>
    <RssSection v-if="emission" :emission="emission" />
    <div class="sharing-distribution-container">
      <router-link
        v-for="platform in platformShare"
        :key="platform.title"
        :to="platform.url"
        class="text-dark"
      >
        <span :class="platform.icon" />{{ platform.title }}
      </router-link>
    </div>
    <SnackBar
      v-if="lazyLoadingSnackbar"
      ref="snackbar"
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import { useApiStore } from "../../../stores/ApiStore";
import classicApi from "../../../api/classicApi";
import SnackBar from "../../misc/SnackBar.vue";
import displayMethods from "../../mixins/displayMethods";
import { Emission } from "@/stores/class/general/emission";

import { defineComponent, defineAsyncComponent } from "vue";
import { mapState } from "pinia";
const RssSection = defineAsyncComponent(
  () => import("@/components/display/aggregator/RssSection.vue"),
);
export default defineComponent({
  components: {
    SnackBar,
    RssSection,
  },
  mixins: [displayMethods],
  props: {
    emissionId: { default: undefined, type: Number },
  },

  data() {
    return {
      emission: undefined as Emission | undefined,
      rss: "" as string,
      lazyLoadingSnackbar: false as boolean,
    };
  },
  computed: {
    ...mapState(useApiStore, ["apiUrl"]),
    platformShare() {
      return [
        {
          url: this.getUrl("amazon"),
          icon: "saooti-amazon-music",
          title: "Amazon Music",
        },
        {
          url: this.getUrl("apple"),
          icon: "saooti-apple-podcast",
          title: "Apple Podcast / iTunes",
        },
        { url: this.getUrl("deezer"), icon: "saooti-deezer", title: "Deezer" },
        { url: this.getUrl("iHeart"), icon: "saooti-iheart", title: "iHeart" },
        {
          url: this.getUrl("PlayerFM"),
          icon: "saooti-playerfm",
          title: "PlayerFM",
        },
        {
          url: this.getUrl("PocketCasts"),
          icon: "saooti-pocket-casts",
          title: "Pocket Casts",
        },
        {
          url: this.getUrl("PodcastAddict"),
          icon: "saooti-podcast-addict",
          title: "Podcast Addict",
        },
        {
          url: this.getUrl("radioline"),
          icon: "saooti-radioline",
          title: "Radioline",
        },
        {
          url: this.getUrl("spotify"),
          icon: "saooti-spotify",
          title: "Spotify",
        },
        { url: this.getUrl("tuneIn"), icon: "saooti-tunin", title: "TuneIn" },
        {
          url: this.getUrl("youtube"),
          icon: "saooti-youtube",
          title: "YouTube Music",
        },
      ];
    },
  },

  mounted() {
    this.getEmissionDetails();
    this.getRSS();
  },

  methods: {
    getUrl(platform: string): string {
      return `/main/priv/distribution/${platform}/${this.emissionId}`;
    },
    async getEmissionDetails(): Promise<void> {
      this.emission = await classicApi.fetchData<Emission>({
        api: 0,
        path: "emission/" + this.emissionId,
      });
    },
    getRSS(): void {
      if (!this.$props.emissionId || this.$props.emissionId <= 0) return;
      this.rss = `${this.apiUrl}rss/emission/${this.emissionId}.rss`;
    },
    afterCopy(): void {
      if (!this.lazyLoadingSnackbar) {
        this.lazyLoadingSnackbar = true;
        setTimeout(() => {
          this.afterCopy();
        }, 500);
      } else {
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Link in clipboard"),
        );
      }
    },
  },
});
</script>

<style lang="scss">
@use '@scss/variables' as octopusVariables;
.octopus-app {
  .sharing-distribution-container {
    border: 0.05rem solid #dee2e6;
    border-radius: octopusVariables.$octopus-borderradius;
    padding: 0.4rem;
    margin: 0.2rem 1rem 0.2rem 0;
    display: flex;
    font-weight: 500;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    a {
      display: flex;
      align-items: center;
      margin: 5px;
    }
    span {
      font-size: 1.4rem;
      margin: 0 0.3em 0 0;
    }
    @media (max-width: 960px) {
      flex-wrap: wrap;
      margin: 0.2rem 0.5rem;
    }
  }
}
</style>
