<template>
  <div class="classic-emoji-picker">
    <button
      id="emoji-picker-dropdown"
      ref="emojiButton"
      class="btn btn-transparent d-flex align-items-center justify-content-center"
      :title="$t('Pick your emoji')"
    >
      <EmoticonExcitedOutlineIcon :size="34" />
    </button>
    <ClassicPopover
      target="emoji-picker-dropdown"
      :only-click="true"
      :is-fixed="true"
      :top-pos="isReallyTopPosition"
      :relative-class="popoverRelativeClass"
      popover-class="popover-z-index"
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
  },
  emits: ["emojiSelected"],

  data() {
    return {
      emojiIndex: emojiIndex,
      hasPlaceAboveButton: true as boolean,
    };
  },
  computed: {
    isReallyTopPosition(): boolean {
      return this.isTopPosition && this.hasPlaceAboveButton;
    },
  },
  mounted() {
    if (this.$refs.emojiButton) {
      this.hasPlaceAboveButton =
        (this.$refs.emojiButton as HTMLButtonElement).getBoundingClientRect()
          .top +
          window.scrollY >
        450;
    }
  },
});
</script>
