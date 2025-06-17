<template>
  <ClassicRadioLabel
    :text-init="sort"
    id-radio="sort-radio"
    :options="optionsArray"
    :radio-label="t('Sort')"
    class-label="text-primary mb-2"
    :type-tag="typeTag"
    class="flex-grow-1"
    @update:text-init="emit('update:sort', $event)"
  />
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicRadioLabel from "../../form/ClassicRadioLabel.vue";
import { computed } from "vue";

//Props 
const props = defineProps({
  isEmission: { default: false, type: Boolean },
  sort: { default: "DATE", type: String },
  typeTag: { default: "fieldset", type: String },
})

//Emits
const emit = defineEmits(["update:sort"]);

//Composables
const { t } = useI18n();

//Computed
const optionsArray = computed(() => {
  const options = [
    { title: t("Sort score"), value: "SCORE" },
    {
      title: t("Sort last"),
      value: props.isEmission ? "LAST_PODCAST_DESC" : "DATE",
    },
    { title: t("Sort name"), value: "NAME" },
  ];
  if (!props.isEmission) {
    options.splice(2, 0, {
      title: t("Chronological"),
      value: "DATE_ASC",
    });
  }
  return options;
});

</script>
