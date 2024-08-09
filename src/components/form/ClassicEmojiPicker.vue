<template>
  <div class="classic-emoji-picker">
    <button
      id="emoji-picker-dropdown"
      class="btn btn-transparent d-flex align-items-center justify-content-center"
      title="TODO"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
        />
        <path
          d="M12.331 9.5a1 1 0 0 1 0 1A5 5 0 0 1 8 13a5 5 0 0 1-4.33-2.5A1 1 0 0 1 4.535 9h6.93a1 1 0 0 1 .866.5M7 6.5c0 .828-.448 0-1 0s-1 .828-1 0S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 0-1 0s-1 .828-1 0S9.448 5 10 5s1 .672 1 1.5"
        />
      </svg>
    </button>
    <ClassicPopover
      target="emoji-picker-dropdown"
      :only-click="true"
      :is-fixed="true"
      :relative-class="popoverRelativeClass"
      popover-class="popover-z-index"
    >
      <!-- TODO default value -->
      <Picker
        :data="emojiIndex"
        title="Pick your emoji…"
        emoji="point_up"
        @select="$emit('emojiSelected', $event.native)"
      />
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import ClassicPopover from "../misc/ClassicPopover.vue";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
let emojiIndex = new EmojiIndex(data);
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicEmojiPicker",
  components: {
    Picker,
    ClassicPopover,
  },
  props: {
    popoverRelativeClass: { default: undefined, type: String },
  },
  emits: ["emojiSelected"],

  data() {
    return {
      emojiIndex: emojiIndex,
    };
  },
});
</script>
