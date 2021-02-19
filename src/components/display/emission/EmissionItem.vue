<template>
  <li class="mt-3" :class="lightItems? 'noList emission-light-max-size':'emission-item-container shadow-element'" v-if="activeEmission ||editRight">
    <router-link 
    :to="{ name: 'emission', params: {emissionId:emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
    :aria-label="$t('Emission')"
    class="text-dark">
      <div class="img-box" :style="{ 'background-image': 'url(\'' + emission.imageUrl + '\')' }" v-if="!lightItems"></div>
      <div class="d-flex" v-else>
        <div class="img-box-light flex-shrink" :style="{ 'background-image': 'url(\'' + emission.imageUrl +'\')' }"></div>
        <div class="emission-light-title">{{ name }}</div>
      </div>
    </router-link>
    <div class="emission-item-text" :class="lightItems?'p-0':''">
      <router-link 
      :to="{ name: 'emission', params: {emissionId:emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
      class="text-dark">
        <div class="emission-name" v-if="!lightItems">
        <img class="icon-caution" src="/img/caution.png" v-if="!activeEmission && !isPodcastmaker && editRight" :title="$t('Emission have not podcasts')"/>{{ name }}</div>
        <div :id="'description-emission-container-'+emission.emissionId" class="emission-description html-wysiwyg-content" :class="lightItems?'emission-small-description':''" >
          <div :id="'description-emission-'+emission.emissionId" v-html="urlify(description)"></div>
        </div>
      </router-link>
      <div class="flex-grow"></div>
      <router-link 
      :to="{ name: 'productor', params: {productorId:emission.orga.id}, query:{productor: $store.state.filter.organisationId}}"
      class="text-dark" v-if="!isPodcastmaker">
        <div class="emission-producer primary-color">© {{ emission.orga.name }}</div>
      </router-link>
    </div>
  </li>
</template>

<style lang="scss">
.emission-item-container {
  list-style: none;
  background: #fff;
  border-radius: 2rem;
  display: flex;
  width: 100%;
  margin: 1rem 0;
  .img-box {
    border-radius: 2rem !important;
  }
}
.emission-light-max-size{
  width: 300px;
  border-bottom: 1px solid #ddd;
}
.emission-light-title{
  color: #333 !important;
  align-self: flex-end;
  text-transform: none;
  font-size: 1.5em;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden; 
  text-overflow: ellipsis;
}

.emission-item-text{
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-height: 13rem;

  .emission-name{
    font-size: 0.9rem;
    font-weight: 600;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }

  .emission-description{
    overflow: hidden;
    margin-top: 0.5em;
    word-break: break-word;
    max-height: 7rem;
    position:relative;
    &.after-emission-description:after{
      content: "...";
      position: absolute;
      padding-left: 1rem;
      right: 0;
      bottom: 0;
      width: 100%;
      font-size: 1rem;
      font-weight: bolder;
      text-align: center;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff 40%);
    }
  }


  .emission-small-description{
    -webkit-line-clamp: 2;
    border-top: 1px solid #ddd;
    word-break: break-word;
  }

  .emission-producer{
    font-weight: 300;
    font-size: 0.6rem;
  }
}

button.btn.btn-primary.share-btn.m-3 {
  font-size: 1rem;
  width: 2.5rem;
  height: 2.5rem !important;
  margin: 0 0.8rem 0 0 !important;
}
/** PHONES*/
@media (max-width: 680px) {
  .emission-item-container {
    flex-wrap: wrap;
    width: auto;
    margin: 0;
    padding: 1rem;
    justify-content: center;
  }
}

@media (max-width: 450px) {
.emission-item-text {
    padding: 0.5rem 0;
    text-align: center;
  }
}
</style>

<script>
import {state} from "../../../store/paramStore.js";
import octopusApi from "@saooti/octopus-api";
import { displayMethods } from '../../mixins/functions';
export default {
  name: 'EmissionItem',

  props: ['emission'],

  mixins: [displayMethods],

  created(){
    this.hasPodcast();
  },
  mounted(){
    if(document.getElementById('description-emission-'+this.emission.emissionId).clientHeight > document.getElementById('description-emission-container-'+this.emission.emissionId).clientHeight){
      document.getElementById('description-emission-container-'+this.emission.emissionId).classList.add("after-emission-description");
    }
  },

  data() {
    return {
      activeEmission: true,
    };
  },

  computed: {
    isPodcastmaker(){
      return state.generalParameters.podcastmaker;
    },

    organisation() {
      return '' + this.emission.publisher.organisation.name;
    },

    lightItems(){
      return state.emissionsPage.lightItems;
    },

    description() {
      let description;
      description = this.emission.description || '';
      if (state.generalParameters.isIE11)
        return description.substring(0, 50) + '...';
      return description;
    },

    name() {
      if (state.generalParameters.isIE11)
        return this.emission.name.substring(0, 50) + '...';
      return this.emission.name;
    },

    organisationId(){
      return state.generalParameters.organisationId;
    },

    authenticated(){
      return state.generalParameters.authenticated;
    },

    editRight() {
      if ((this.authenticated && this.organisationId === this.emission.orga.id) ||state.generalParameters.isAdmin)
        return true;
      return false;
    }
  },

   methods:{
    async hasPodcast(){
      const data = await octopusApi.fetchPodcasts({
        emissionId: this.emission.emissionId,
        first: 0,
        size: 0,
        });
      if(0 === data.count){
        this.activeEmission = false;
      }
      if(this.editRight || this.activeEmission){
        return;
      }
      this.$emit("emissionNotVisible");
    }
  },
};
</script>
