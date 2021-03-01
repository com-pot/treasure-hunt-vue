<template>
  <h1>Minigame part</h1>
  <template v-if="viewState === 'loading'">
    Loading...
  </template>

  <template v-else-if="viewState === 'ready' && componentSpec">
    <component
        :is="componentSpec"
        :minigameData="minigameData"
        @minigameSignal="$emit('sotwSignal', $event)"
    />
  </template>

  <template v-else>
    Whoooooops!
  </template>
</template>

<script lang="ts">
import {defineComponent, ref, shallowRef, watch} from "vue";
import {loadMinigameComponent} from "@/modules/Minigames/minigameUtils";

import {ViewState} from "../types/views";

type MinigameState = 'idle' | 'running' | 'finished';



export default defineComponent({
  emits: ['sotwSignal'],
  props: {
    minigameId: {type: String, required: true},
    minigameData: {type: Object, required: true},
  },
  setup(props) {
    const viewState = ref<ViewState>('loading');
    const minigameState = ref<MinigameState>('idle');
    const componentSpec = shallowRef<any>(null);

    async function loadMinigame(minigameId: string) {
      viewState.value = "loading";
      minigameState.value = "idle";

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
      minigameState.value = "running";
    }

    watch(() => props.minigameId, loadMinigame, {immediate: true});

    return {
      viewState,
      componentSpec,
      minigameState,
    };
  },
});
</script>
