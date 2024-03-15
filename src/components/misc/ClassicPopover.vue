<template>
  <div
    v-show="show && !disable"
    :id="'popover' + target"
    ref="popover"
    tabindex="0"
    class="octopus-popover"
    :class="[onlyClick ? 'octopus-dropdown' : '', popoverClass]"
    :style="positionInlineStyle"
    @blur="clearDataBlur"
    @mouseenter="overPopover = true"
    @mouseleave="
      overPopover = false;
      clearData();
    "
  >
    <div v-if="title" class="bg-secondary p-2">
      {{ title }}
    </div>
    <div class="p-2">
      <slot>{{ content }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicPopover",
  props: {
    content: { type: String, default: "" },
    title: { type: String, default: "" },
    target: { type: String, required: true },
    disable: { type: Boolean, default: false },
    onlyClick: { type: Boolean, default: false },
    onlyMouse: { type: Boolean, default: false },
    isFixed: { type: Boolean, default: false },
    relativeClass: { type: String, default: undefined },
    leftPos: { type: Boolean, default: false },
    topPos: { type: Boolean, default: false },
    popoverClass: { type: String, default: undefined },
  },
  data() {
    return {
      show: false as boolean,
      isClick: false as boolean,
      posX: 0 as number,
      posY: 0 as number,
      targetElement: null as HTMLElement | null,
      overPopover: false as boolean,
    };
  },
  computed: {
    popoverId(): string {
      return "popover" + this.target;
    },
    positionInlineStyle(): string {
      return `left: ${this.posX}px; top: ${this.posY}px;`;
    },
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.removeListeners();
  },
  methods: {
    init() {
      this.targetElement = document.getElementById(this.target);
      if (this.targetElement) {
        if (!this.onlyClick) {
          this.targetElement.addEventListener(
            "mouseenter",
            this.setPopoverData,
          );
          this.targetElement.addEventListener(
            "mouseleave",
            this.clearDataTimeout,
          );
        }
        if (!this.onlyMouse) {
          this.targetElement.addEventListener("click", this.setPopoverData);
        }
        this.targetElement.addEventListener("blur", this.clearDataBlur);
      }
    },
    removeListeners() {
      if (this.targetElement) {
        if (!this.onlyClick) {
          this.targetElement.removeEventListener(
            "mouseenter",
            this.setPopoverData,
          );
          this.targetElement.removeEventListener(
            "mouseleave",
            this.clearDataTimeout,
          );
        }
        if (!this.onlyMouse) {
          this.targetElement.removeEventListener("click", this.setPopoverData);
        }
        this.targetElement.addEventListener("blur", this.clearDataBlur);
      }
    },
    setPopoverData(e: MouseEvent | PointerEvent) {
      if (this.disable || !e || !e.target) {
        return;
      }
      if ("click" === e.type) {
        if (this.show && this.isClick) {
          this.isClick = false;
          this.clearData();
          return;
        }
        this.isClick = true;
      }
      this.show = true;
      let parentLeft = 0;
      let parentRight = 0;
      let parentTop = 0;
      let parentScrollTop = 0;
      if (this.relativeClass) {
        const modalBody = document.getElementsByClassName(
          this.relativeClass,
        )[0];
        if (undefined === modalBody) {
          (this.$refs.popover as HTMLElement).style.display = "block";
          this.posX = 0;
          this.posY = 0;
          return;
        }
        const modalBodyRect = modalBody.getBoundingClientRect();
        parentLeft = modalBodyRect.left;
        parentRight = modalBodyRect.right;
        parentTop = modalBodyRect.top;
        parentScrollTop = modalBody.scrollTop;
      }
      const rectElement = (e.target as HTMLElement).getBoundingClientRect();
      (this.$refs.popover as HTMLElement).style.display = "block";
      if (this.leftPos) {
        this.posX =
          rectElement.right -
          parentRight -
          (this.$refs.popover as HTMLElement).clientWidth;
      } else {
        this.posX = rectElement.left - parentLeft;
      }
      this.posX = Math.max(0, this.posX);
      const yPosParent = this.topPos ? rectElement.top : rectElement.bottom;
      const yGap = this.topPos
        ? -5 - (this.$refs.popover as HTMLElement).clientHeight
        : 5;
      this.posY =
        yPosParent +
        parentScrollTop -
        parentTop +
        (this.isFixed ? 0 : window.scrollY) +
        yGap;
    },
    async clearDataBlur(e: FocusEvent) {
      if (!e.relatedTarget) {
        return this.clearClick();
      }
      const myElement = e.relatedTarget as HTMLElement;
      if (this.popoverId === myElement.id) {
        return;
      }
      const parent = this.$refs.popover as HTMLElement;
      if (null === parent || !parent.contains(myElement)) {
        return this.clearClick();
      }
      if (
        null === myElement.classList ||
        !myElement.classList.contains("octopus-dropdown-item")
      ) {
        return;
      }
      if (!(myElement as HTMLAnchorElement).href) {
        return this.clearClick();
      }
      if ("true" === myElement.getAttribute("reallink")) {
        myElement.click();
      } else {
        await this.$router.push((myElement as HTMLAnchorElement).pathname);
      }
      this.$nextTick(() => {
        this.isClick = false;
        this.clearData();
      });
    },
    clearClick() {
      this.isClick = false;
      this.clearData();
    },
    clearDataTimeout() {
      setTimeout(() => {
        if (!this.overPopover) {
          this.clearData();
        }
      }, 500);
    },
    clearData() {
      if (this.isClick) {
        return;
      }
      this.show = false;
      this.posX = 0;
      this.posY = 0;
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-popover {
  background: white;
  border: 1px solid #ccc;
  border-radius: $octopus-borderradius;
  position: absolute;
  z-index: 9999;
  max-height: 80vh;
  overflow: auto;
  &.octopus-dropdown {
    min-width: 200px;
    .octopus-dropdown-item {
      display: flex;
      justify-content: center;
      color: rgb(29, 29, 29);
      width: 100%;
      padding: 0.25rem 1rem;
      font-weight: 400;
      text-decoration: none;
      white-space: nowrap;
      background-color: transparent;
      border: 0;
      &:hover {
        background: rgb(243, 243, 243);
      }
    }
    hr {
      margin: 0.5rem 0;
      overflow: hidden;
      border-top: 1px solid #ccc;
      opacity: 1;
    }
  }
}
</style>
