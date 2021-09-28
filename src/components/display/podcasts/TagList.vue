<template>
  <div v-if="undefined !== tagList">
    <ul class="d-flex flex-wrap">
      <li class="tagListElement" v-for="tag in tagList" :key="tag">
        <router-link
          :to="{
            name: 'search',
            query: {
              query: tag,
              productor: $store.state.filter.organisationId,
            },
          }"
          class="tagListLink"
          >{{ tag }}</router-link
        >
      </li>
    </ul>
  </div>
</template>
<style lang="scss">
.tagListElement {
  display: flex;
  margin: 0.4rem;
  padding: 0.8rem;
  border: 1px solid #999;
  cursor: pointer;
}
.tagListLink {
  font-weight: 700;
  font-size: 1.2rem;
  color: #666;
  &:hover {
    color: #666;
  }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TagList',
  components: {},
  props: {
    tagList: { default: () => ([])  as Array<string>},
  },

  methods: {},
})
</script>
