<template>
  <div class="d-flex align-items-center">
    <div
      class="filter-organisation-chooser"
      v-if="!isPodcastmaker && !filterOrga"
    >
      <OrganisationChooser
        :defaultanswer="$t('No organisation filter')"
        @selected="onOrganisationSelected"
        :value="organisationId"
        :all="true"
      />
      <div class="checkbox-saooti m-3" v-if="!!organisationId">
        <input
          type="checkbox"
          class="custom-control-input"
          id="orgaCheck"
          v-model="keepOrganisation"
          @click="onKeepOrganisation"
        />
        <label class="custom-control-label" for="orgaCheck"></label>
      </div>
      <div class="filter-speech-bubble" v-if="showBubble">
        {{
          $t(
            'check this box if you want to keep this filter for the rest of your visit'
          )
        }}
      </div>
    </div>
    <div class="d-flex align-items-center flex-grow">
      <label for="search" class="d-inline" :aria-label="$t('Search')"></label>
      <input
        id="search"
        class="filter-search-input input-no-outline"
        :placeholder="searchText"
        :value="searchPattern"
        ref="search"
        v-on:input="
          event => this.$emit('updateSearchPattern', event.target.value)
        "
      />
    </div>
  </div>
</template>
<style lang="scss">
@import '../../../sass/_variables.scss';

.filter-speech-bubble {
  position: absolute;
  background: $octopus-primary-color;
  border-radius: 0.4em;
  width: 10rem;
  right: 4rem;
  padding: 5px;
  -webkit-animation: fadein 1s;
  -moz-animation: fadein 1s;
  animation: fadein 1s;
  color: white;
}

.filter-speech-bubble:after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 0;
  height: 0;
  border: 18px solid transparent;
  border-left-color: $octopus-primary-color;
  border-right: 0;
  border-bottom: 0;
  margin-top: -9px;
  margin-right: -18px;
  -webkit-animation: fadein 1s;
  -moz-animation: fadein 1s;
  animation: fadein 1s;
}
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-moz-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.filter-organisation-chooser {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-right: 10%;
  position: relative;
  @media (max-width: 500px) {
    margin-right: 0;
  }
}
</style>
<script lang="ts">
// @ is an alias to /src
import OrganisationChooser from '../organisation/OrganisationChooser.vue';
import { state } from '../../../store/paramStore.js';
const octopusApi = require('@saooti/octopus-api');
import store from '@/store/AppStore';
import { defineComponent, ref } from 'vue'
export default defineComponent({
  components: {
    OrganisationChooser,
  },

  props: {
    organisationId: { default: undefined as any },
    searchPattern: { default: '' },
    type: { default: 'podcast' },
  },
  setup() {
    const search : any = ref(null);
    return {
      search,
    };
  },

  async created() {
    if (!this.organisationId) return;
    store.commit('filterOrga', { orgaId: this.organisationId });
    const isLive = await octopusApi.liveEnabledOrganisation(
      this.organisationId
    );
    store.commit('filterOrgaLive', isLive);
    this.keepOrganisation = true;
    if (!this.$route.query.productor) {
      this.$router.replace({ query: { productor: this.organisationId } });
    }
  },

  mounted() {
    if (this.search) {
      this.search.focus();
    }
  },

  data() {
    return {
      keepOrganisation: false,
      showBubble: false,
      imgUrl: undefined as any,
    };
  },

  computed: {
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    searchText():string {
      if ('emission' === this.type) return this.$t('Look for emission name');
      if ('participant' === this.type)
        return this.$t('Look for participant name');
      if ('playlist' === this.type) return this.$t('Look for playlist name');
      return this.$t('Look for podcast name');
    },
    filterOrga() {
      return store.state.filter.organisationId;
    },
  },

  methods: {
    onOrganisationSelected(organisation: any) {
      if (this.$route.query.productor) {
        this.$router.push({ query: { productor: undefined } });
      }
      this.imgUrl = organisation.imageUrl;
      store.commit('filterOrga', {
        orgaId: undefined as any,
        imgUrl: this.imgUrl,
      });
      this.keepOrganisation = false;
      if (organisation && organisation.id) {
        this.showBubble = true;
        setTimeout(() => {
          this.showBubble = false;
        }, 6000);
        this.$emit('updateOrganisationId', organisation.id);
      } else {
        this.$emit('updateOrganisationId', undefined);
      }
    },
    async onKeepOrganisation() {
      if (!this.keepOrganisation) {
        if (this.$route.query.productor !== this.organisationId) {
          this.$router.push({ query: { productor: this.organisationId } });
        }
        store.commit('filterOrga', {
          orgaId: this.organisationId,
          imgUrl: this.imgUrl,
        });
        const isLive = await octopusApi.liveEnabledOrganisation(
          this.organisationId
        );
        store.commit('filterOrgaLive', isLive);
        return;
      }
      if (this.$route.query.productor) {
        this.$router.push({ query: { productor: undefined } });
      }
      store.commit('filterOrga', { orgaId: undefined });
    },
  },
  watch: {
    filterOrga() {
      if (this.filterOrga) {
        this.keepOrganisation = true;
        this.$emit('updateOrganisationId', this.filterOrga);
      } else {
        this.keepOrganisation = false;
      }
    },
  },
});
</script>
