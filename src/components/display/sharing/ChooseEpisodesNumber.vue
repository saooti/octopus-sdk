<template>
  <div class="d-flex align-items-center flex-wrap">
    <span class="flex-shrink-0">{{ t("Show") }}</span>
    <input
      id="number-input"
      v-model="internNumber"
      type="number"
      min="1"
      max="50"
      class="input-share-player border text-center m-2"
      :title="t('Number of player podcasts')"
    />
    <span class="flex-shrink-0">{{ t("Last podcasts") }}</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props
const props = defineProps({
  episodesNumber: { default: 3, type: Number },
});

//Emits
const emit = defineEmits(["updateNumber"]);

//Data
const internNumber = ref(3);

//Composables
const { t } = useI18n();

//Watch
watch(internNumber, () => {
  if (internNumber.value < 1) {
    emit("updateNumber", 1);
  }else if(internNumber.value > 50){
    emit("updateNumber", 50);
  }else{
    emit("updateNumber", internNumber.value);
  }
});

onBeforeMount(()=>{
  internNumber.value = props.episodesNumber;
})

</script>

<style lang="scss">
.octopus-app {
  .input-share-player {
    border-radius: 50px;
    width: 60px;
  }
}
</style>
