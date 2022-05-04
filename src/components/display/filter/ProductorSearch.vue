<template>
  <div class="d-flex align-items-center my-3">
    <div
      v-if="!isPodcastmaker && !filterOrga"
      class="filter-organisation-chooser"
    >
      <OrganisationChooser
        :defaultanswer="$t('No organisation filter')"
        :value="organisationId"
        @selected="onOrganisationSelected"
      />
      <ClassicCheckbox
        v-if="!!organisationId"
        v-model:textInit="keepOrganisation"
        class="m-3"
        :label="$t('check this box if you want to keep this filter for the rest of your visit')"
        :display-label="false"
        id-checkbox="organisation-checkbox"
        @clickAction="onKeepOrganisation"
      />
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
    <ClassicSearch
      v-model:textInit="queryIntern"
      class="d-flex align-items-center flex-grow-1"
      :autofocus="true"
      id-checkbox="productor-search-input"
      :label="searchText"
    />
  </div>
</template>

<script lang="ts">
import ClassicSearch from '../../form/ClassicSearch.vue';
import { state } from '../../../store/paramStore';
import { orgaFilter } from '../../mixins/organisationFilter';
import { Organisation } from '@/store/class/general/organisation';
import { defineComponent, defineAsyncComponent } from 'vue';
const OrganisationChooser = defineAsyncComponent(() => import('../organisation/OrganisationChooser.vue'));
const ClassicCheckbox = defineAsyncComponent(() => import('../../form/ClassicCheckbox.vue'));
export default defineComponent({
  components: {
    OrganisationChooser,
    ClassicSearch,
    ClassicCheckbox
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
      queryIntern: '' as string,
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
    queryIntern(): void {
      if(this.queryIntern !== this.searchPattern)
      this.$emit('updateSearchPattern', this.queryIntern);
    },
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
    if(this.searchPattern){
      this.queryIntern=this.searchPattern;
    }
    if (!this.organisationId) return;
    if(this.$store.state.filter.organisationId === this.organisationId){
      this.keepOrganisation = true;
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
        this.$emit('updateOrganisationId', organisation.id);
        if("PUBLIC"!==organisation.privacy){
          this.$nextTick(() => {
            this.onKeepOrganisation();
          });
        } else{
          this.showBubble = true;
          setTimeout(() => {
            this.showBubble = false;
          }, 6000);
        }
      } else {
        this.$emit('updateOrganisationId', undefined);
      }
    },
    async onKeepOrganisation(): Promise<void> {
      if(!this.organisationId){return}
      if (!this.keepOrganisation) {
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
.octopus-app{
.filter-speech-bubble {
  position: absolute;
  background: $octopus-primary-dark;
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
  border-left-color: $octopus-primary-dark;
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
}
</style>