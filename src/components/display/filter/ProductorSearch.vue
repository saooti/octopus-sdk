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
        :readonly="notInitFocus"
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
import { state } from '../../../store/paramStore';
import { orgaFilter } from '../../mixins/organisationFilter';
import { Organisation } from '@/store/class/organisation';
export default orgaFilter.extend({
  components: {
    OrganisationChooser: () => import('../organisation/OrganisationChooser.vue'),
  },

  props: {
    organisationId: { default: undefined as string|undefined },
    searchPattern: { default: '' as string },
    type: { default: 'podcast' as string },
  },

  data() {
    return {
      keepOrganisation: false as boolean,
      showBubble: false as boolean,
      imgUrl: '' as string,
      notInitFocus: true as boolean
    };
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
 
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
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
});
</script>
