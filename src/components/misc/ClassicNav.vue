<!--
  Component to make a tab-based navigation
  @deprecated Use ClassicTabs instead
-->
<template>
  <ul class="octopus-nav" :class="light ? 'light' : ''">
    <li
      v-for="index in tabNumber"
      v-show="$slots[index - 1]"
      :key="index - 1"
      class="octopus-nav-item"
    >
      <button
        class="octopus-nav-link"
        :class="activeTab === index - 1 ? 'active' : ''"
        @click="emit('update:activeTab', index - 1)"
      >
        <slot :name="index - 1" />
      </button>
    </li>
  </ul>
  <div
    :class="
      transparent
        ? 'd-flex flex-grow-1 classic-nav-tab-container'
        : 'octopus-tab-content'
    "
  >
    <div
      v-for="index in tabNumber"
      v-show="$slots['tab' + (index - 1)]"
      :key="index - 1"
      class="octopus-tab-pane"
      :class="{ active: activeTab === index - 1, 'flex-column': flexColumn }"
    >
      <slot :name="'tab' + (index - 1)" :is-active="activeTab === index - 1" />
    </div>
  </div>
</template>

<script setup lang="ts">

//Props 
defineProps({
  /** Number of tabs to display */
  tabNumber: { default: 0, type: Number },
  /** Currently active tab */
  activeTab: { default: 0, type: Number },
  /** Alternative css */
  transparent: { default: false, type: Boolean },
  /** Alternative css */
  light: { default: false, type: Boolean },
  /** Vertical content */
  flexColumn: { default: false, type: Boolean }
})

//Emits
const emit = defineEmits(["update:activeTab"]);

</script>

<style lang="scss">


.octopus-app {
  .octopus-nav {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    margin-top: 0;
    list-style: none;
    border-bottom: 0.05rem solid var(--octopus-border-default);

    &.light {
      border: 0;
    }
  }

  .octopus-nav-item {
    border-right: solid 1px var(--octopus-border-default);
    border-left: solid 1px var(--octopus-border-default);
    border-top: solid 1px var(--octopus-border-default);
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    flex-grow: 1;
    text-align: center;
  }

  .octopus-tab-content {
    border-right: solid 1px var(--octopus-border-default);
    border-left: solid 1px var(--octopus-border-default);
    border-bottom: solid 1px var(--octopus-border-default);
    background-color: var(--octopus-background);
  }
  .octopus-nav.light  .octopus-tab-content{
    border-top: solid 1px var(--octopus-border-default);
  }


  .octopus-nav.light .octopus-nav-item {
    border: 0;
  }

  .octopus-nav-link {
    display: block;
    background: transparent;
    flex-grow: 1;
    padding: 0.5rem 1rem;
    text-decoration: none;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out;
    border: 0.1rem solid transparent;

    &:hover {
      border-color: var(--octopus-border-default);
      border-bottom-color: var(--octopus-primary);
      color: var(--octopus-primary);
    }

    &.active {
      border-color: var(--octopus-primary);
      background: var(--octopus-primary);
      color: white;
    }
  }

  .octopus-nav.light .octopus-nav-link {
    font-weight: bold;
    background:var(--octopus-border-default);
    &.active{
      border-bottom-color: var(--octopus-primary);
      background: transparent;
      color: var(--octopus-primary);
    }
  }


  .octopus-tab-pane {
    display: none;

    &.active {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      flex-grow: 1;
      @media (width <= 550px) {
        padding:0;
      }
    }
  }
}
</style>
