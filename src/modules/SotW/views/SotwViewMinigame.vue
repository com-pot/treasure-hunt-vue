<template>
  <h1>Minigame part</h1>
  <template v-if="viewState === 'loading'">
    Loading...
  </template>

  <template v-else-if="viewState === 'ready' && componentSpec">
    <component :is="componentSpec" @minigameSignal="$emit('sotwSignal', $event)"/>
  </template>

  <template v-else>
    Whoooooops!
  </template>
</template>

<script lang="ts">
import {defineComponent, ref, shallowRef, watch} from "vue";
import {loadMinigameComponent} from "@/modules/Minigames/minigameUtils";

import {ViewState} from "../types/views";

export default defineComponent({
  emits: ['sotwSignal'],
  props: {
    minigameId: {type: String, required: true},
    minigameData: {type: Object, required: true},
    viewStateData: {type: Object},
  },
  setup(props) {
    const viewState = ref<ViewState>('loading');
    const componentSpec = shallowRef<any>(null);

    async function loadMinigame(minigameId: string) {
      viewState.value = "loading";

      let minigameModule;
      try {
        minigameModule = await loadMinigameComponent(minigameId);
      } catch (e) {
        console.error(e);
        viewState.value = "error";
        return;
      }

      componentSpec.value = minigameModule.default;
      viewState.value = "ready";
    }

    watch(() => props.minigameId, loadMinigame, {immediate: true});

    return {
      viewState,
      componentSpec,
      console,
    };
  },
});
</script>
