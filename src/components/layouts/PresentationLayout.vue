<!--
  A simple layout to display 5 elements over 3 columns
-->
<template>
  <div class="d-flex flex-column p-3">
    <h2 v-if="title">
      {{ title }}
    </h2>
    
    <div class="d-flex flex-nowrap align-items-stretch overflow-phone-auto">
      <!-- First column & first item -->
      <slot
        v-if="items[0]"
        name="first" :item="items[0]"
      >
        <slot name="item" :item="items[0]" :first="true" />
      </slot>

      <!-- Second column & second/third items -->
      <div
        v-if="items.length > 1"
        class="column column-margin d-flex-row flex-nowrap"
        :class="items.length <= 3 ? 'flex-grow-1' : ''"
      >
        <slot
          v-if="items[1]"
          name="item"
          :item="items[1]"
          :first="false"
        />
        <slot
          v-if="items[2]"
          name="item"
          :item="items[2]"
          :first="false"
        />
      </div>

      <!-- Third column & fourth/fifth items -->
      <div
        v-if="items.length > 3"
        class="column d-flex-row flex-nowrap show-column"
      >
        <slot
          v-if="items[3]"
          name="item"
          :item="items[3]"
          :first="false"
        />
        <slot
          v-if="items[4]"
          name="item"
          :item="items[4]"
          :first="false"
        />
      </div>
    </div>

    <!-- Redirection button -->
    <router-link
      v-if="route"
      :to="route"
      class="btn btn-primary align-self-center w-fit-content m-4"
    >
      {{ buttonText || $t('See more') }}
    </router-link>
  </div>
</template>

<script setup lang="ts" generic="T">
import { RouteParams } from 'vue-router';

//Props 
defineProps<{
  /** The items to display */
  items: Array<T>;
  /** The title to display at the top of the layout */
  title?: string;
  /** If defined, the route to which the 'See more' button will redirect to */
  route?: RouteParams|string;
  /** The label on the 'See more' button */
  buttonText?: string;
}>();
</script>

<style lang="scss">
.octopus-app {
  .overflow-phone-auto {
    @media (width <= 960px) {
      overflow-y: auto;
      scroll-snap-type: x mandatory;

      .classic-element-container{
        scroll-snap-align: center;
      }
    }
  }

  .column {
    flex-shrink: 0;
    width: calc((100% - 420px) / 2);

    @media (width <= 1550px) {
      width: calc((100% - 420px));
    }

    @media (width <= 960px) {
      width: auto;
      flex-direction: row !important;
    }
  }

  .column-margin {
    margin-right: 1rem;

    @media (width <= 960px) {
      margin-right: 0;
    }
  }

  .show-column {
    display: flex;

    @media (width <= 1550px) and (width > 960px) {
      display: none;
    }
  }
}
</style>
