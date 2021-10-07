<template>
  <div
    :id="id"
    ref="element"
    class="popover"
    role="tooltip"
    tabindex="-1"
  >
    <div ref="titleRef">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div ref="contentRef">
      <slot>
        {{ content }}
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import {Popover} from 'bootstrap'
import {defineComponent, onMounted, PropType, ref, watch} from 'vue'
import useEventListener from '../../helper/useEventListener'
export default defineComponent({
  name: 'Popover',
  props: {
    content: {type: String, default: ''},
    id: {type: String, default: ''},
    noninteractive: {type: Boolean, default: false},
    placement: {type: String as PropType<Popover.Options['placement']>, default: 'right'},
    target: {type: String, required: true},
    title: {type: String, default: ''},
    triggers: {type: String as PropType<Popover.Options['trigger']>, default: 'click'},
    show: {type: Boolean, default: false},
  },
  emits: ['show', 'shown', 'hide', 'hidden', 'inserted'],
  setup(props, {emit}) {
    const element = ref<HTMLElement>()
    const target = ref<HTMLElement>()
    const instance = ref<Popover>()
    const titleRef = ref<HTMLElement>()
    const contentRef = ref<HTMLElement>()
    onMounted(() => {
      instance.value = new Popover(`#${props.target}`, {
        container: 'body',
        trigger: props.triggers,
        placement: props.placement,
        title: titleRef.value?.innerHTML || '',
        content: contentRef.value?.innerHTML || '',
        html: true,
      })
      if (document.getElementById(props.target)) {
        target.value = document.getElementById(props.target) as HTMLElement
      }
      element.value?.parentNode?.removeChild(element.value)
      if (props.show) {
        instance.value.show()
      }
    })
    watch(
      () => props.show,
      (show, oldVal) => {
        if (show !== oldVal) {
          if (show) {
            instance.value?.show()
          } else {
            instance.value?.hide()
          }
        }
      }
    )
    useEventListener(target, 'show.bs.popover', () => emit('show'))
    useEventListener(target, 'shown.bs.popover', () => emit('shown'))
    useEventListener(target, 'hide.bs.popover', () => emit('hide'))
    useEventListener(target, 'hidden.bs.popover', () => emit('hidden'))
    useEventListener(target, 'inserted.bs.popover', () => emit('inserted'))
    return {
      element,
      titleRef,
      contentRef,
    }
  },
})
</script>