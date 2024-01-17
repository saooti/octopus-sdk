<script lang="ts" setup>
import { isServer } from "../../helper/environment";
</script>
<template>
  <slot v-if="isServer" />
</template>
