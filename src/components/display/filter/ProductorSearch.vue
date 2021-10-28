<template>
  <div class="d-flex align-items-center">
    <div
      v-if="!isPodcastmaker && !filterOrga"
      class="filter-organisation-chooser"
    >
      <OrganisationChooser
        :defaultanswer="$t('No organisation filter')"
        :value="organisationId"
        :all="true"
        @selected="onOrganisationSelected"
      />
      <div
        v-if="!!organisationId"
        class="m-3"
      >
        <input
          id="orgaCheck"
          v-model="keepOrganisation"
          type="checkbox"
          class="form-check-input"
          @click="onKeepOrganisation"
        >
        <label
          class="form-check-label"
          for="orgaCheck"
        />
      </div>
      <div
        v-if="showBubble"
        class="filter-speech-bubble"
      >
        {{
          $t(
            'check this box if you want to keep this filter for the rest of your visit'
          )
        }}
      </div>
    </div>
    <div class="d-flex align-items-center flex-grow">
      <label
        for="search"
        class="d-inline"
        :aria-label="$t('Search')"
      />
      <input
        id="search"
        ref="search"
        class="filter-search-input input-no-outline"
        :placeholder="searchText"
        :value="searchPattern"
        :readonly="notInitFocus"
        @input="
          event => $emit('updateSearchPattern', event.target.value)
        "
      >
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { orgaFilter } from '../../mixins/organisationFilter';
import { Organisation } from '@/store/class/organisation';
import { defineComponent, defineAsyncComponent } from 'vue';
const OrganisationChooser = defineAsyncComponent(() => import('../organisation/OrganisationChooser.vue'));
export default defineComponent({
  components: {
    OrganisationChooser,
  },
  mixins:[orgaFilter],

  props: {
    organisationId: { default: undefined, type: String},
    searchPattern: { default: '', type: String },
    type: { default: 'podcast', type: String },
  },
  emits: ['updateOrganisationId', 'updateSearchPattern'],

  data() {
    return {
      keepOrganisation: false as boolean,
      showBubble: false as boolean,
      imgUrl: '' as string,
      notInitFocus: true as boolean
    };
  },
 
  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    searchText(): string {
      if ('emission' === this.type) return this.$t('Look for emission name').toString();
      if ('participant' === this.type)
        return this.$t('Look for participant name').toString();
      if ('playlist' === this.type) return this.$t('Look for playlist name').toString();
      return this.$t('Look for podcast name').toString();
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
  },
  watch: {
    filterOrga(): void {
      if (this.filterOrga) {
        this.keepOrganisation = true;
        this.$emit('updateOrganisationId', this.filterOrga);
      } else {
        this.keepOrganisation = false;
      }
    },
  },
  async created() {
    if (!this.organisationId) return;
    if(this.$store.state.filter.organisationId === this.organisationId){
      this.keepOrganisation = true;
    }
  },
  mounted() {
    if (this.$refs.search) {
      (this.$refs.search as HTMLElement).focus();
      this.notInitFocus = false;
    }
  },
  methods: {
    onOrganisationSelected(organisation: Organisation): void {
      if (this.$route.query.productor) {
        this.$router.push({ query: { productor: undefined } });
      }
      this.imgUrl = organisation.imageUrl;
      this.$store.commit('filterOrga', {
        orgaId: undefined,
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
    async onKeepOrganisation(): Promise<void> {
      if(!this.organisationId){return}
      if (!this.keepOrganisation) {
        if (this.$route.query.productor !== this.organisationId) {
          this.$router.push({ query: { productor: this.organisationId } });
        }
        await this.selectOrganisation(this.organisationId);
        return;
      }
      if (this.$route.query.productor) {
        this.$router.push({ query: { productor: undefined } });
      }
      this.$store.commit('filterOrga', { orgaId: undefined });
    },
  },
})
</script>

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