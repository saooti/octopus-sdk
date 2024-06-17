<template>
  <div
    ref="targetEl"
    :style="`min-height:${minHeight}px`"
  >
    <slot v-if="shouldRender" />
    <slot v-else name="preview" />
  </div>
</template>
<script lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { ref, nextTick, watch } from "vue";

function onIdle(cb = () => {}) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb);
  } else {
    setTimeout(() => {
      nextTick(cb);
    }, 300);
  }
}

export default {
  props: {
    renderOnIdle: Boolean,
    unrender: Boolean,
    minHeight: {
      type: Number,
      default: 0,
    },
    initRenderDelay: {
      type: Number,
      default: 0,
    },
    unrenderDelay: {
      type: Number,
      default: 10000,
    },
  },
  emits:['isRender'],
  setup(props, context) {
    const waitBeforeInit = ref(true);
    const shouldRender = ref(false);
    const targetEl = ref();
    //const fixedMinHeight = ref(0);
    let unrenderTimer: ReturnType<typeof setTimeout> | undefined;
    let renderTimer: ReturnType<typeof setTimeout> | undefined;
    setTimeout(() => {
      waitBeforeInit.value = false;
    }, props.initRenderDelay);
    const { isActive, pause, resume } = useIntersectionObserver(
      targetEl,
      ([{ isIntersecting }]) => {
        if (waitBeforeInit.value) {
          return;
        }
        if (isIntersecting) {
          // perhaps the user re-scrolled to a component that was set to unrender. In that case stop the unrendering timer
          clearTimeout(unrenderTimer);
          // if we're dealing underndering lets add a waiting period of 200ms before rendering. If a component enters the viewport and also leaves it within 200ms it will not render at all. This saves work and improves performance when user scrolls very fast

          renderTimer = setTimeout(
            () => {
              shouldRender.value = true;
              context.emit('isRender', true);
            },
            props.unrender ? 200 : 0,
          );
          if (!props.unrender) {
            pause();
          }
        } else if (props.unrender) {
          // if the component was set to render, cancel that
          clearTimeout(renderTimer);
          unrenderTimer = setTimeout(() => {
            //fixedMinHeight.value = targetEl.value?.clientHeight ?? 0;
            shouldRender.value = false;
            context.emit('isRender', false);
          }, props.unrenderDelay);
        }
      },
      {
        rootMargin: "600px",
      },
    );

    if (props.renderOnIdle) {
      onIdle(() => {
        shouldRender.value = true;
        context.emit('isRender', true);
        if (!props.unrender) {
          pause();
        }
      });
    }
    watch(() => props.unrender, (newValue, oldValue) => {
     if (newValue) {
        clearTimeout(renderTimer);
        unrenderTimer = setTimeout(() => {
          shouldRender.value = false;
          context.emit('isRender', false);
          resume();
        }, props.unrenderDelay);
      }
    });

    return { targetEl, shouldRender/* , fixedMinHeight  */};
  },
};
</script>
