<template>
  <div v-if="!isPhone" class="classic-emoji-picker">
    <button
      :id="buttonId"
      ref="emojiButton"
      class="btn btn-transparent d-flex align-items-center justify-content-center"
      :title="t('Pick your emoji')"
    >
      <EmoticonExcitedOutlineIcon :size="34" />
    </button>
    <ClassicPopover
      :target="buttonId"
      :only-click="true"
      :is-fixed="true"
      :is-top-layer="isTopPosition"
      :top-pos="isTopPosition"
      :relative-class="popoverRelativeClass"
      :popover-class="isTopPosition?'popover-z-index':''"
    >
      <Picker
        :data="emojiIndex"
        :title="t('Pick your emoji')"
        emoji="point_up"
        @select="emit('emojiSelected', $event.native)"
      />
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import {useResizePhone} from "../composable/useResizePhone";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ClassicPopover from "../misc/ClassicPopover.vue";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import { computed, useId } from "vue";
import { useI18n } from "vue-i18n";

//Props
const props = defineProps({
  popoverRelativeClass: { default: undefined, type: String },
  isTopPosition: { default: false, type: Boolean },
  id: { default: "", type: String },
})

//Emits
const emit = defineEmits(["emojiSelected"]);

//Data 
const emojiIndex = new EmojiIndex(data);

//Composables
const { t } = useI18n();
const { isPhone } = useResizePhone();
const generatedId = useId();

//Computed
// Must be unique: ClassicPopover binds to its target with getElementById
const buttonId = computed(() => "emoji-picker-dropdown" + (props.id || generatedId));
</script>

<style lang="scss">
// Not scoped: the picker is a child component, teleported by ClassicPopover
// Only the clickable emojis: the "no results" one is not a button
.emoji-mart .emoji-mart-category button.emoji-mart-emoji {
  cursor: pointer;

  span {
    cursor: pointer;
  }
}
</style>

