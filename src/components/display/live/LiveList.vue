<template>
  <div
    v-if="filterOrgaId || organisationId"
    class="d-flex flex-column align-items-center"
  >
    <ClassicLoading
      :loading-text="loading?$t('Loading lives...'):undefined"
      :error-text="isNoLive?$t('No live currently'):undefined"
    />
    <div v-if="loaded && displayNextLiveMessage">
      <h3 class="text-danger">
        {{ displayNextLiveMessage }}
      </h3>
    </div>
    <template
      v-for="(live, indexLive) in livesArray"
      :key="live.status"
    >
      <template v-if="live.lives.length">
        <hr class="w-100">
        <p class="live-list-category">
          {{ live.title }}
        </p>
        <LiveItem
          v-for="(l, index) in live.lives"
          :key="l.podcastId"
          class="mt-3"
          :fetch-conference="l"
          :index="index"
          @deleteItem="deleteLive(indexLive, $event)"
        />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import ClassicLoading from '../../form/ClassicLoading.vue';
import LiveItem from './LiveItem.vue';
import { handle403 } from '../../mixins/handle403';
import octopusApi from '@saooti/octopus-api';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);
import { useFilterStore } from '@/stores/FilterStore';
import { mapState } from 'pinia';
import { state } from '../../../stores/ParamSdkStore';
import { Conference } from '@/stores/class/conference/conference';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
export default defineComponent({
  name: 'LiveList',
  components: {
    LiveItem,
    ClassicLoading
  },

  mixins: [handle403],

  props: {
    conferenceWatched: { default: () => [], type: Array as ()=>Array<Conference>},
    organisationId: { default: undefined, type: String},
  },
  emits: ['initConferenceIds'],
  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      dataLivesToBe: [] as Array<Conference>
    };
  },
  
  computed: {
    ...mapState(useFilterStore, ['filterOrgaId']),
    livesArray(): Array<{status:string, title:string, lives:Array<Conference>}>{
      return [
        {status: "RECORDING", title:this.$t('In live'), lives:[]},
        {status: "PENDING", title:this.$t('This live is not started yet'), lives:[]},
        {status: "PLANNED", title:this.$t('Live to be'), lives:[]},
        {status: "DEBRIEFING", title:this.$t('Live terminated'), lives:[]},
        {status: "PUBLISHING", title:this.$t('Publishing'), lives:[]},
        {status: "ERROR", title:this.$t('In error'), lives:[]}
      ];
    },
    isNoLive(): boolean{
      return this.loaded && !this.livesArray[0].lives.length && !this.livesArray[2].lives.length && !this.livesArray[3].lives.length;
    },
    filterOrgaUsed(): string|undefined {
      return this.filterOrgaId?this.filterOrgaId:this.organisationId;
    },
    displayNextLiveMessage(): string {
      if (0 !== this.livesArray[0].lives.length) return '';
      if (this.livesArray[1].lives.length > 0)
        return this.$t('A live can start any moment');
      if (this.livesArray[2].lives.length > 0)
        return this.$t('Next live date', {date: dayjs(this.livesArray[2].lives[0].date).format('LLLL'),});
      return '';
    },
    myOrganisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    organisationRight(): boolean {
      return this.isRoleLive && this.myOrganisationId === this.filterOrgaUsed;
    },
    isRoleLive(): boolean {
      return (state.generalParameters.isRoleLive as boolean);
    },
  },
  watch: {
    async organisationId(): Promise<void> {
      if(!this.organisationId){return;}
      const isLive = await octopusApi.fetchData<boolean>(0, 'organisation/liveEnabled/'+this.organisationId);
      if (isLive) {
        if(!this.loading){
          this.fetchContent();
        }
      } else {
        this.initArrays();
        this.loading = false;
        this.loaded = true;
      }
    },
    filterOrgaId(): void {
      if(!this.loading){
        this.fetchContent();
      }
    },
    conferenceWatched: {
      handler(): void {
        this.updateLiveLocal();
      },
      deep: true,
    },
  },

  async created() {
    if(!this.filterOrgaUsed){
      return;
    }
    const isLive = await octopusApi.fetchData<boolean>(0, 'organisation/liveEnabled/'+this.filterOrgaUsed);
    if (isLive) {
      this.fetchContent();
    } else {
      this.loading = false;
      this.loaded = true;
    }
  },
  methods: {
    initArrays(): void {
      for (let i = 0, len = this.livesArray.length; i < len; i++) {
        this.livesArray[i].lives.length = 0;
      }
    },
    liveTreatement(i: number, dataLives: Array<Conference>, indexPast: number){
      if("PLANNED"!==this.livesArray[i].status && "PENDING"!==this.livesArray[i].status){
        this.livesArray[i].lives = dataLives.filter((p: Conference | null) => {
          return null !== p;
        });
      }else if("PENDING"===this.livesArray[i].status){
        this.dataLivesToBe = dataLives;
        for (let index = 0, len = dataLives.length; index < len; index++) {
          if (dayjs(dataLives[index].date).isBefore(dayjs())) {
            this.livesArray[i].lives.push(dataLives[index]);
            indexPast = index + 1;
          } else {break;}
        }
      }else{
        this.livesArray[i].lives = this.dataLivesToBe
        .slice(indexPast)
        .concat(dataLives)
        .filter((p: Conference | null) => {
          return null !== p;
        });
      }
      return indexPast;
    },
    async fetchLives(): Promise<void>{
      let indexPast = 0;
      this.dataLivesToBe = [];
      for (let i = 0, len = this.livesArray.length; i < len; i++) {
        if (!this.organisationRight && 
        ("DEBRIEFING"===this.livesArray[i].status ||"ERROR"===this.livesArray[i].status ||"PUBLISHING"===this.livesArray[i].status)) {
          continue;
        }
        const dataLives = await octopusApi.fetchDataWithParams<Array<Conference>>(9, 'conference/list',{
          organisationId: this.filterOrgaUsed,
          withPodcastId: true,
          status: this.livesArray[i].status,
        });
        indexPast = this.liveTreatement(i, dataLives, indexPast);
      }
    },
    async fetchContent(): Promise<void> {
      try {
        this.initArrays();
        if (!this.filterOrgaUsed) {
          this.loading = false;
          this.loaded = true;
          return;
        }
        this.loading = true;
        this.loaded = false;
        await this.fetchLives();
        const listIds = this.livesArray[0].lives
          .concat(this.livesArray[1].lives)
          .concat(this.livesArray[2].lives);
        this.$emit('initConferenceIds', listIds);
      } catch (error) {
        this.handle403((error as AxiosError));
      }
      this.loading = false;
      this.loaded = true;
    },
    deleteLive(indexLives: number, index: number): void {
      this.livesArray[indexLives].lives.splice(index, 1);
    },
    updateLiveLocal(): void {
      for (
        let index = 0, len = this.conferenceWatched.length;
        index < len;
        index++
      ) {
        const element = this.conferenceWatched[index];
        const indexLivesToBe = this.livesArray[1].lives.findIndex(
          (el: Conference) => el.conferenceId === element.conferenceId
        );
        if (-1 === indexLivesToBe) {
          const indexLives = this.livesArray[0].lives.findIndex(
            (el: Conference) => el.conferenceId === element.conferenceId
          );
          if (-1 === indexLives || 'DEBRIEFING' !== element.status) continue;
          const newConf = this.livesArray[0].lives[indexLives];
          newConf.status = element.status;
          this.livesArray[0].lives.splice(indexLives, 1);
          this.livesArray[3].lives.push(newConf);
          break;
        }
        if ('RECORDING' !== element.status) continue;
        const newConf = this.livesArray[1].lives[indexLivesToBe];
        newConf.status = element.status;
        this.livesArray[1].lives.splice(indexLivesToBe, 1);
        this.livesArray[0].lives.push(newConf);
        break;
      }
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.live-list-category {
  align-self: flex-start;
  text-transform: uppercase;
  font-weight: bold;
}
}
</style>
