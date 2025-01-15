<template>
  <div
    v-show="displayPopover"
    :id="'popover' + target"
    ref="popover"
    popover
    tabindex="0"
    class="octopus-popover"
    :class="[
      displayPopover ? 'd-block': '',
      onlyClick ? 'octopus-dropdown' : '',
      isFixed && isTopLayerPopover ? 'position-fixed':'position-absolute',
      popoverClass]"
    :style="positionInlineStyle"
    @focusout="clearDataBlur"
    @mouseenter="overPopover = true"
    @mouseleave="
      overPopover = false;
      clearData();
    "
  >
    <div v-if="title" class="bg-secondary-light p-2">
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
    isTopLayer: { type: Boolean, default: false },
  },
  emits: ["updateVisibility"],
  data() {
    return {
      show: false as boolean,
      isClick: false as boolean,
      posX: 0 as number,
      posY: 0 as number,
      targetElement: null as HTMLElement | null,
      overPopover: false as boolean,
      isTabAction: false as boolean,
      maxHeight: '80vh' as string,
      clearTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  computed: {
    popoverId(): string {
      return "popover" + this.target;
    },
    positionInlineStyle(): string {
      return `left: ${this.posX}px; top: ${this.posY}px;max-height:${this.maxHeight}`;
    },
    displayPopover(): boolean{
      return this.show && !this.disable;
    },
    isTopLayerPopover(){
      return (this.isTopLayer || "octopus-modal"===this.relativeClass) && HTMLElement.prototype.hasOwnProperty("popover");
    },
  },
  watch: {
    displayPopover(){
      if(!this.isTopLayerPopover){
        return;
      }
      if(this.displayPopover){
        (this.$refs.popover as HTMLElement).showPopover();
      }else{
        (this.$refs.popover as HTMLElement).hidePopover();
      }
    },
    show() {
      this.$emit("updateVisibility", this.show);
      if (this.show) {
        window.addEventListener("keyup", this.addAccessibilityControl);
      } else {
        window.removeEventListener("keyup", this.addAccessibilityControl);
      }
    },
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.removeListeners();
  },
  methods: {
    addAccessibilityControl(event: KeyboardEvent): void {
      if (!event || null === event) {
        return;
      }
      if ("Tab" !== event.key) {
        return;
      }
      const myElement = event.target as HTMLElement;
      const parent = this.$refs.popover as HTMLElement;
      if (parent?.contains(myElement)) {
        this.isTabAction = true;
      } else {
        this.clearClick();
      }
    },
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
        this.targetElement.addEventListener("focusout", this.clearDataBlur);
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
        this.targetElement.removeEventListener("focusout", this.clearDataBlur);
      }
    },
    setPopoverData(e: MouseEvent | PointerEvent) {
      clearInterval(this.clearTimeout as unknown as number);
      if (this.disable || !e || !e.target) {
        return;
      }
      if ("click" === e.type) {
        if (this.show && this.isClick) {
          this.isClick = false;
          this.clearData();
          return;
        }
        if (this.show && this.isTopLayerPopover) {
          (this.$refs.popover as HTMLElement).showPopover();
          this.isClick = true;
          return;
        }
        this.isClick = true;
      }
      this.show = true;
      let parentLeft = 0;
      let parentRight = 0;
      let parentTop = 0;
      let parentScrollTop = 0;
      let parentBottom = 0;
      if (!this.isTopLayerPopover && this.relativeClass) {
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
        parentBottom=modalBodyRect.bottom;
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
      if(this.isTopLayerPopover){
        this.posY = Math.max(0, this.posY);
        this.maxHeight = (window.innerHeight - this.posY) + "px";
      }else if(this.relativeClass){
        this.maxHeight = (parentBottom- this.posY -parentTop) + "px";
      }else{
        this.maxHeight = '80vh';
      }
    },
    clearDataBlur(e: FocusEvent) {
      if (this.isTabAction) {
        this.isTabAction = false;
        return;
      }
      //Exception timepicker in popover
      if (e?.target?.classList?.contains("dp__time_display")) {
        return;
      }
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
        this.$router.push((myElement as HTMLAnchorElement).pathname);
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
      this.clearTimeout = setTimeout(() => {
        if (!this.overPopover) {
          this.clearData();
        }
        this.clearTimeout=undefined;
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


.octopus-popover {
  background: var(--octopus-background);
  border: 1px solid var(--octopus-border-default);
  border-radius: var(--octopus-border-radius);
  overflow: auto;
  margin: 0 !important;
  z-index: 10;

  &.popover-z-index {
    z-index: 9999;
  }

  &.octopus-dropdown {
    min-width: 200px;

    .octopus-dropdown-item {
      display: flex;
      justify-content: center;
      color: var(--octopus-color-text);
      width: 100%;
      padding: 0.25rem 1rem;
      font-weight: 400;
      text-decoration: none;
      white-space: nowrap;
      background-color: transparent;
      border: 0;

      &:disabled {
        background: var(--octopus-secondary-darker);
      }

      &:hover,
      &:focus {
        background: var(--octopus-secondary-lighter);
      }
    }

    hr {
      margin: 0.5rem 0;
      overflow: hidden;
      border-top: 1px solid var(--octopus-border-default);
      opacity: 1;
    }
  }
}
</style>
