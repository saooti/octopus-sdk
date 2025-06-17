<template>
    <div class="format-switch">
      <input 
        id="format-switch-checkbox"
        :checked="isSvg"
        class="format-switch-checkbox" 
        type="checkbox" 
        @input="changeIsSvg"/>
      <label class="format-switch-label" for="format-switch-checkbox">
        <span class="format-switch-label-span">SVG</span>
      </label>
    </div>
  </template>
  
<script setup lang="ts">

//Props 
const props = defineProps({
  isSvg: { default: true, type: Boolean },
})

//Emits
const emit = defineEmits(['update:isSvg']);

//Methods
function changeIsSvg(){
  emit('update:isSvg', !props.isSvg)
}
</script>
  <style lang="scss">
  .octopus-app {

    --format-switch-size:140px;
    --format-switch-half: calc(var(--format-switch-size) / 2 );
  
    .format-switch {
      background: var(--octopus-secondary);
      border-radius: 30px;
      overflow: hidden;
      width: var(--format-switch-size);
      text-align: center;
      color: black;
      border: 2px solid var(--octopus-secondary);
      padding-right: var(--format-switch-half);
      position: relative;
  
      &::before {
        content: "PNG";
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: var(--format-switch-half);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        pointer-events: none;
      }
  
    
      &-checkbox {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: 2;
        margin: 0;
  
        & + .format-switch-label {
          position: relative;
          padding: 0.5rem 0;
          display: block;
          user-select: none;
          pointer-events: none;
  
          &::before {
            content: "";
            background: white;
            height: 100%;
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            border-radius: 30px;
            transform: translateX(var(--format-switch-half));
            transition: transform 300ms;
          }
  
          .format-switch-label-span {
            position: relative;
          }
        }
  
        &:checked + .format-switch-label::before {
          transform: translateX(0px);
          transition: transform 300ms linear;
        }
      }
  
      &:has(input:focus-visible){
        box-shadow: 0 0 10px 1px  var(--octopus-primary) !important;
      }
    }
  }
  </style>