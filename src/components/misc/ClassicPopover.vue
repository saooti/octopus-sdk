<template>
  <Teleport to="#app">
    <div
      v-show="displayPopover"
      :id="'popover' + target"
      ref="popover"
      popover
      tabindex="0"
      class="octopus-popover border position-fixed"
      :class="[
        displayPopover ? 'd-block': '',
        onlyClick ? 'octopus-dropdown' : '',
        popoverClass]"
      :style="positionInlineStyle"
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
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, Ref, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

//Props 
const props = defineProps({
  content: { type: String, default: "" },
  title: { type: String, default: "" },
  target: { type: String, required: true },
  disable: { type: Boolean, default: false },
  onlyClick: { type: Boolean, default: false },
  onlyMouse: { type: Boolean, default: false },
  isFixed: { type: Boolean, default: false },
  /** @deprecated No longer needed. The popover is teleported to body and always uses position:fixed. */
  relativeClass: { type: String, default: undefined },
  leftPos: { type: Boolean, default: false },
  topPos: { type: Boolean, default: false },
  popoverClass: { type: String, default: undefined },
  isTopLayer: { type: Boolean, default: false },
  /** @deprecated No longer needed. If set to true, max height of popover will not overflow from parent */
  constrainHeight: { type: Boolean, default: true },
  /** Force z-index */
  zIndex: { type: Number, default: undefined }
})

//Emits
const emit = defineEmits(["updateVisibility"]);


//Data
const show = ref(false);
const isClick = ref(false);
const openedByHover = ref(false);
const posX = ref(0);
const posY = ref(0);
const targetElement: Ref<HTMLElement | null> = ref(null);
const overPopover = ref(false);
const isTabAction = ref(false);
const maxHeight = ref('80dvh');
const clearTimeout: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);
const popoverRef = useTemplateRef('popover');


//Composables
const router = useRouter();

//Computed
const popoverId = computed(() => "popover" + props.target);
const positionInlineStyle = computed(() => ({
  left: `${posX.value}px`,
  top: `${posY.value}px`,
  'max-height': maxHeight.value,
  'z-index': props.zIndex ?? 10
}));
const displayPopover = computed(() => show.value && !props.disable);
const isTopLayerPopover = computed(() => (props.isTopLayer || "octopus-modal"===props.relativeClass) && Object.hasOwn(HTMLElement.prototype, "popover"));


//Watch
watch(displayPopover, async () => {
  if(!isTopLayerPopover.value){return;}
  if(displayPopover.value){
    (popoverRef.value as HTMLElement).showPopover();
  }else{
    (popoverRef.value as HTMLElement).hidePopover();
  }
});
watch(show, async () => {
  emit("updateVisibility", show.value);
  if (show.value) {
    window.addEventListener("keyup", addAccessibilityControl);
  } else {
    window.removeEventListener("keyup", addAccessibilityControl);
  }
});
watch(isClick, async () => {
  // Only add global click listener if opened by click (not hover)
  if (isClick.value && !openedByHover.value) {
    window.addEventListener("click", handleOutsideClick, true);
  } else {
    window.removeEventListener("click", handleOutsideClick, true);
  }
});

onMounted(()=>init())

onUnmounted(()=>removeListeners())


//Methods
function handleOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const popover = popoverRef?.value as HTMLElement;
  const targetEl = targetElement.value;

  // Check if click is outside both the popover and the target element
  if (
    popover &&
    !popover.contains(target) &&
    targetEl &&
    !targetEl.contains(target)
  ) {
    clearClick();
  }
}
function addAccessibilityControl(event: KeyboardEvent): void {
  if (!event || null === event) {
    return;
  }
  if ("Tab" !== event.key) {
    return;
  }
  const myElement = event.target as HTMLElement;
  const parent = popoverRef?.value as HTMLElement;
  if (parent?.contains(myElement)) {
    isTabAction.value = true;
  } else {
    clearClick();
  }
}
function init() {
  targetElement.value = document.getElementById(props.target);
  if (targetElement.value) {
    if (!props.onlyClick) {
      targetElement.value.addEventListener( "mouseenter",setPopoverData);
      targetElement.value.addEventListener("mouseleave",clearDataTimeout);
    }
    if (!props.onlyMouse) {
      targetElement.value.addEventListener("click", setPopoverData);
    }
    targetElement.value.addEventListener("focusout", clearDataBlur);
  }
}
function removeListeners() {
  if (targetElement.value) {
    if (!props.onlyClick) {
      targetElement.value.removeEventListener("mouseenter",setPopoverData,);
      targetElement.value.removeEventListener("mouseleave",clearDataTimeout,);
    }
    if (!props.onlyMouse) {
      targetElement.value.removeEventListener("click", setPopoverData);
    }
    targetElement.value.removeEventListener("focusout", clearDataBlur);
  }
}
function handleClickEvent(e: MouseEvent | PointerEvent){
  if (show.value && isClick.value && e.target !== popoverRef.value && !popoverRef.value?.contains(e.target)) {
    isClick.value = false;
    clearData();
    return -1;
  }
  if (show.value && isTopLayerPopover.value) {
    const popover = popoverRef?.value as HTMLElement;
    popover.showPopover();
    isClick.value = true;
    return -1;
  }
  isClick.value = true;
  return 0;
}
function handleLeftPos(rectElement: DOMRect, parentLeft: number, sizeAvailable: number, sizePopover: number){
  const elementRightRelative = rectElement.right - parentLeft;
  const hasPlaceRightButton = (sizeAvailable - (sizeAvailable - elementRightRelative)) > sizePopover;
  if(hasPlaceRightButton){
    posX.value =
    rectElement.right -
    parentLeft -
    sizePopover;
  }else{
    posX.value =parentLeft;
  }
}
function handleRightPos(rectElement: DOMRect, parentLeft: number, sizeAvailable: number, sizePopover: number){
  const elementLeftRelative = rectElement.left - parentLeft;
  const hasPlaceRightButton = (sizeAvailable - elementLeftRelative) > sizePopover;
  if(hasPlaceRightButton){
    posX.value = elementLeftRelative;
  }else{
    posX.value = sizeAvailable - sizePopover + parentLeft;
  }
}
function setPopoverData(e: MouseEvent | PointerEvent) {
  clearInterval(clearTimeout.value as unknown as number);
  if (props.disable || !e || !e.target) {
    return;
  }
  if ("click" === e.type && -1 === handleClickEvent(e)) {
    return;
  }
  // Track if opened by hover (mouseenter) vs click
  if (e.type === "mouseenter") {
    openedByHover.value = true;
  }
  show.value = true;
  const popover = popoverRef?.value as HTMLElement;
  // The popover is teleported to <body> and uses position:fixed, so
  // getBoundingClientRect() coordinates map directly to viewport coordinates.
  const rectElement = (e.target as HTMLElement).getBoundingClientRect();
  popover.style.display = "block";
  const sizePopover = popover.clientWidth;
  if (props.leftPos) {
    handleLeftPos(rectElement, 0, window.innerWidth, sizePopover);
  } else {
    handleRightPos(rectElement, 0, window.innerWidth, sizePopover);
  }
  posX.value = Math.max(0, posX.value);
  const yPosParent = props.topPos ? rectElement.top : rectElement.bottom;
  const yGap = props.topPos
    ? -5 - popover.clientHeight
    : 5;
  posY.value = Math.max(0, yPosParent + yGap);
  maxHeight.value = (window.innerHeight - posY.value) + "px";
}

function clearDataBlur(e: FocusEvent) {
  if (isTabAction.value) {
    isTabAction.value = false;
    return;
  }
  //Exception timepicker in popover
  const result = Array.from(e?.target?.classList ?? []).findIndex((val) => { return val.startsWith("dp__");});
  if (-1!==result) {
    return;
  }

  const parent = popoverRef?.value as HTMLElement;
  if (!e.relatedTarget) {
    if (parent !== null && parent.contains(e.target)) {
      return;
    }
    return clearClick();
  }
  const myElement = e.relatedTarget as HTMLElement;
  if (popoverId.value === myElement.id) {
    return;
  }
  if (null === parent || !parent.contains(myElement)) {
    return clearClick();
  }
  if (
    null === myElement.classList ||
    !myElement.classList.contains("octopus-dropdown-item")
  ) {
    return;
  }
  if (!(myElement as HTMLAnchorElement).href) {
    return clearClick();
  }
  if (myElement.classList.contains("realLink")) {
    myElement.click();
  } else {
    router.push((myElement as HTMLAnchorElement).pathname);
  }
  nextTick(() => {
    isClick.value = false;
    clearData();
  });
}
function clearClick() {
  isClick.value = false;
  clearData();
}
function clearDataTimeout() {
  clearTimeout.value = setTimeout(() => {
    if (!overPopover.value) {
      clearData();
    }
    clearTimeout.value=undefined;
  }, 500);
}
function clearData() {
  // Allow closing if opened by hover, even if clicked afterwards
  if (isClick.value && !openedByHover.value) {
    return;
  }
  show.value = false;
  posX.value = 0;
  posY.value = 0;
  openedByHover.value = false;
}

//Expose
defineExpose({
  clearClick
});
</script>

<style lang="scss">
.octopus-popover {
  background: var(--octopus-background);
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

      &:is(:hover, :focus){
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
