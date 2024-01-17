<script lang="ts" setup>
import { isClient } from "../../helper/environment";
</script>
<template>
  <slot v-if="isClient" />
</template>
