<template>
  <div v-if="!isPhone" class="classic-emoji-picker">
    <button
      :id="'emoji-picker-dropdown'+id"
      ref="emojiButton"
      class="btn btn-transparent d-flex align-items-center justify-content-center"
      :title="$t('Pick your emoji')"
    >
      <EmoticonExcitedOutlineIcon :size="34" />
    </button>
    <ClassicPopover
      :target="'emoji-picker-dropdown'+id"
      :only-click="true"
      :is-fixed="true"
      :is-top-layer="isTopPosition"
      :top-pos="isTopPosition"
      :relative-class="popoverRelativeClass"
      :popover-class="isTopPosition?'popover-z-index':''"
    >
      <Picker
        :data="emojiIndex"
        :title="$t('Pick your emoji')"
        emoji="point_up"
        @select="$emit('emojiSelected', $event.native)"
      />
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import {useResizePhone} from "../composable/useResizePhone";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ClassicPopover from "../misc/ClassicPopover.vue";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
const emojiIndex = new EmojiIndex(data);
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicEmojiPicker",
  components: {
    Picker,
    ClassicPopover,
    EmoticonExcitedOutlineIcon,
  },
  props: {
    popoverRelativeClass: { default: undefined, type: String },
    isTopPosition: { default: false, type: Boolean },
    id: { default: "", type: String },
  },
  emits: ["emojiSelected"],
  setup(){
    const { isPhone } = useResizePhone();
    return { isPhone }
  },

  data() {
    return {
      emojiIndex: emojiIndex,
    };
  },
});
</script>

