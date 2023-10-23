<template>
  <ListPaginate
    id="participantListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="
      showCount && displayCount > 1
        ? `${$t('Number participants', { nb: displayCount })} ${$t(
            'sort by score',
          )}`
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? $t('Loading participants ...') : undefined"
  >
    <template #list>
      <div class="podcast-list">
        <ClassicLazy
          v-for="p in displayArray"
          :key="p.participantId"
          :min-height="360"
          :unrender="true"
        >
          <ParticipantItem v-if="0 !== p.participantId" :participant="p" />
          <template #preview>
            <router-link
              :to="{
                name: 'participant',
                params: { participantId: p.participantId },
              }"
            >
              {{ p.lastName }}
            </router-link>
          </template>
        </ClassicLazy>
      </div>
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import { handle403 } from "../../mixins/handle403";
import octopusApi from "@saooti/octopus-api";
import ParticipantItem from "./ParticipantItem.vue";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import {
  Participant,
  emptyParticipantData,
} from "@/stores/class/general/participant";
import { defineComponent } from "vue";
import { AxiosError } from "axios";
export default defineComponent({
  name: "ParticipantList",

  components: {
    ParticipantItem,
    ListPaginate,
    ClassicLazy,
  },

  mixins: [handle403],

  props: {
    first: { default: 0, type: Number },
    size: { default: 30, type: Number },
    query: { default: undefined, type: String },
    organisationId: { default: undefined, type: String },
    showCount: { default: false, type: Boolean },
  },

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first,
      dsize: this.size,
      totalCount: 0 as number,
      displayCount: 0 as number,
      participants: [] as Array<Participant>,
      isMobile: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    displayArray(): Array<Participant> {
      if (this.isMobile) {
        return this.participants;
      }
      return this.participants.slice(
        this.dfirst,
        Math.min(this.dfirst + this.dsize, this.totalCount),
      );
    },
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
  },
  watch: {
    query(): void {
      this.reloadList();
    },
    organisation(): void {
      this.reloadList();
    },
    dsize(): void {
      this.reloadList();
    },
    dfirst(): void {
      if (
        !this.participants[this.dfirst] ||
        0 === this.participants[this.dfirst].participantId
      ) {
        this.fetchContent(false);
      }
    },
  },

  created() {
    this.fetchContent(true);
  },
  methods: {
    reloadList() {
      this.dfirst = 0;
      this.fetchContent(true);
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      try {
        const data = await octopusApi.fetchDataWithParams<{
          count: number;
          result: Array<Participant>;
          sort: string;
        }>(
          0,
          "participant/search",
          {
            first: this.dfirst,
            size: this.dsize,
            query: this.query,
            organisationId: this.organisation,
          },
          true,
        );
        if (reset) {
          this.participants.length = 0;
        }
        this.displayCount = data.count;
        if (this.dfirst > this.participants.length) {
          for (
            let i = this.participants.length - 1,
              len = this.dfirst + this.dsize;
            i < len;
            i++
          ) {
            this.participants.push(emptyParticipantData());
          }
        }
        const responseParticipants = data.result.filter(
          (p: Participant | null) => {
            if (null === p) {
              this.displayCount--;
            }
            return null !== p;
          },
        );
        this.participants = this.participants
          .slice(0, this.dfirst)
          .concat(responseParticipants)
          .concat(
            this.participants.slice(
              this.dfirst + this.dsize,
              this.participants.length,
            ),
          );
        this.totalCount = data.count;
      } catch (error) {
        this.handle403(error as AxiosError);
      }
      this.loading = false;
    },
  },
});
</script>
