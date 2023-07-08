<template>
  <h1>Rejstřík miniher</h1>

  <div class="minigame-links">
    <template v-for="bundle in bundles">
      <div class="source-heading">
        <span>{{bundle.caption}}</span>
      </div>

      <template v-for="(link, i) in bundle.minigames">
        <router-link v-if="link.name" :key="'link-' + i" class="minigame-link btn -acc-primary"
                     :to="{name: 'minigame.dev.detail', params: {minigame: link.name}}"
        >
          <span class="code">{{ bundle.name }}-{{ formatOrderNumber(i + 1) }}</span>
          <span class="caption">{{ link.caption }}</span>
        </router-link>

        <div v-else :key="'dead-link-' + i" class="minigame-link btn -acc-secondary">
          <span class="code">{{ bundle.name }}-{{ formatOrderNumber(i + 1) }}</span>
          <span class="caption">{{ link.caption }}</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {listMinigameBundles} from "../../utils/minigameUtils"
import {Awaited} from "@src/utils/timingUtils"

export default defineComponent({
  setup() {
    const bundles = ref<Awaited<ReturnType<typeof listMinigameBundles>>>([])
    listMinigameBundles()
      .then((list) => bundles.value = list)

    return {
      bundles,
      formatOrderNumber: (i: number) => i < 10 ? '0' + i : '' + i,
    };
  },
});
</script>

<style lang="scss">
.minigame-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5em;

  align-content: center;

  .source-heading {
    grid-column: 1 / -1;

    font-size: 2rem;
  }

  .minigame-link {
    height: 6rem;
    padding: 0.5rem;

    font-weight: bold;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: start;
    justify-content: space-between;

    .code {
      font-size: 0.75em;
      position: relative;
      top: -1rem;

      background: inherit;
      border: inherit;
      padding: 0.1rem 0.2rem;
    }
  }

  > a {
    text-decoration: none;
  }
}

</style>
