<!-- A simple component to display a blur & a banner on an image -->
<template>
    <div class="blur-with-banner">
        <div class="banner">
            <slot />
        </div>
    </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.blur-with-banner {
  position: absolute;
  inset: 0;
  background-color:var(--octopus-background-transparent);
  // Allow pointer events to go through (allow click on image beneath blur)
  pointer-events: none;

  .banner {
    text-align: center;
    width: 100%;
    font-size: 0.6rem;
    padding: 0.2rem 0;
    color: white;
    background: black;
    text-transform: uppercase;
    position: absolute;
    top: 0;
  }
}
</style>