<template>
  <div class="minigame-index">
    <div class="links">
      <template v-for="(link, i) in minigames">
        <router-link v-if="link.to" :key="'link-' + i" :to="link.to">
          <span>{{ formatOrderNumber(i + 1) }}</span>
          <span>{{ link.caption }}</span>
        </router-link>

        <div v-else :key="'dead-link-' + i">
          <span>{{ formatOrderNumber(i + 1) }}</span>
          <span>{{ link.caption }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, computed} from "vue";
import {RouteLocationRaw} from "vue-router";

type MinigameLink = { caption: string, to?: RouteLocationRaw };

export default defineComponent({
  props: {
    showBack: {type: Boolean, required: true},
    minigames: {type: Array as PropType<MinigameLink[]>, required: true},
  },
  setup() {
    return {
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

      background: #444;
      font-weight: bold;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: start;
      justify-content: flex-end;
    }

    > a {
      text-decoration: none;
      color: deeppink;
    }

    > div {
      color: #CCC;
    }
  }
}
</style>
