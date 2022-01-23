<template>
  <div class="minigame-index">
    <div class="links">
      <template v-for="(link, i) in minigames">
        <router-link v-if="link.name" :key="'link-' + i" :to="{name: 'minigame.dev.detail', params: {minigame: link.name}}" class="btn btn-vivid">
          <span>{{ formatOrderNumber(i + 1) }}</span>
          <span>{{ link.caption }}</span>
        </router-link>

        <div v-else :key="'dead-link-' + i" class="btn btn-bland">
          <span>{{ formatOrderNumber(i + 1) }}</span>
          <span>{{ link.caption }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {listMinigames} from "../../utils/minigameUtils"
import {Awaited} from "@/utils/timingUtils"

export default defineComponent({
  props: {
    showBack: {type: Boolean, required: true},
  },
  setup() {
    const minigames = ref<Awaited<ReturnType<typeof listMinigames>>>([])
    listMinigames()
      .then((list) => minigames.value = list)

    return {
      minigames,
      formatOrderNumber: (i: number) => i < 10 ? '0' + i : '' + i,
    };
  },
});
</script>

<style lang="scss">
.minigame-index {

  .links {
    display: grid;
    grid-template-columns: repeat(3, minmax(120px, 1fr));
    gap: 0.5em;

    align-content: center;

    > * {
      height: 90px;
      padding: 8px;
      border-radius: 4px;

      font-weight: bold;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: start;
      justify-content: flex-end;

      &:last-child {
        grid-column: 2;
      }
    }

    > a {
      text-decoration: none;
    }
  }
}
</style>
