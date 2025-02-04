<template>
  <div>
    <button
      class="btn-like-comment"
      :class="{
        'is-active': isActive,
        'is-dislike': !like,
      }"
      :title="titleButton"
      @click="clickButton"
    >
      <template v-if="like">
        <ThumbUpOutlineIcon v-if="!isActive" />
        <ThumbUpIcon v-else />
      </template>
      <template v-else>
        <ThumbDownOutlineIcon v-if="!isActive" />
        <ThumbDownIcon v-else />
      </template>
    </button>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
const ThumbUpIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/ThumbUp.vue"),
);
const ThumbDownIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/ThumbDown.vue"),
);
const ThumbUpOutlineIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/ThumbUpOutline.vue"),
);
const ThumbDownOutlineIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/ThumbDownOutline.vue"),
);
const SnackBar = defineAsyncComponent(
  () => import("../../../misc/SnackBar.vue"),
);
export default defineComponent({
  name: "LikeButton",

  components: {
    SnackBar,
    ThumbUpOutlineIcon,
    ThumbDownOutlineIcon,
    ThumbDownIcon,
    ThumbUpIcon,
  },
  props: {
    like: { default: true, type: Boolean },
    isActive: { default: false, type: Boolean },
    canInteract: { default: false, type: Boolean },
  },

  emits: ["like-action"],
  computed: {
    actionName(): string {
      if (this.like) {
        return this.isActive ? "dislike" : "like";
      }
      return this.isActive ? "like" : "dislike";
    },
    titleButton(): string {
      return this.like ? this.$t("Like") : this.$t("Dislike");
    },
  },
  methods: {
    clickButton() {
      if (this.canInteract) {
        this.$emit("like-action", this.actionName);
      } else {
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.$t("Log in to access this service"),
        );
      }
    },
  },
});
</script>
<style lang="scss">
@use "sass:color";

.octopus-app .btn-like-comment {
  $background-color: var(--octopus-primary);

  &.is-dislike {
    $background-color: black;
  }

  position: relative;
  cursor: pointer;
  border: none;
  outline: none;
  z-index: 1;
  color: var(--octopus-color-text);
  font-size: 1.2rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--octopus-secondary);
    color: oklch(from var(--octopus-color-text) calc(l + 0.1) c h);
  }

  /* Animation */
  &.is-active {
    z-index: 2;
    color: white;
    background: $background-color;
    animation: 0.8s;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -2px;
      margin-top: -2px;
      width: 6px;
      height: 6px;
      border-radius: 100%;
      transform: scale(0);
      color: var(--octopus-color-text);;
      border: 1px solid transparent;
      box-shadow:
        -0.8em 0 0 -2px,
        0.8em 0 0 -2px,
        0 -0.8em 0 -2px,
        0 0.8em 0 -2px,
        -0.6em -0.6em 0 -2px,
        -0.6em 0.6em 0 -2px,
        0.6em -0.6em 0 -2px,
        0.6em 0.6em 0 -2px;
    }

    &::before {
      animation: effect-01-animation 0.8s
        cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    &::after {
      animation: effect-02-animation 0.6s
        cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }

  @keyframes effect-01-animation {
    0% {
      transform: rotate(-15deg) scale(0);
    }

    40% {
      opacity: 1;
    }

    100% {
      transform: rotate(-30deg) scale(2.5);
      opacity: 0;
    }
  }

  @keyframes effect-02-animation {
    0% {
      transform: rotate(10deg) scale(0);
    }

    40% {
      opacity: 1;
    }

    100% {
      transform: rotate(30deg) scale(2);
      opacity: 0;
    }
  }
}
</style>
