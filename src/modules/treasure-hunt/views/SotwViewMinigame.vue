<template>
  <template v-if="componentStatus === 'loading'">Probíhá příprava výzvy...</template>

  <template v-else-if="componentStatus === 'ready' && componentSpec">
    <p v-html="viewData.description.replaceAll('\n', '<br/>')"></p>
    <component :is="componentSpec"/>
  </template>

  <template v-else>Jejda?</template>
</template>

<script lang="ts">
import {defineComponent, shallowRef, watch} from "vue";
import {loadMinigameComponent} from "@src/modules/treasure-hunt/utils/minigameUtils"

import {useViewData} from "../components/minigameData"
import {hasComponentStatus} from "@src/modules/Layout/utils/componentHelpers"

export default defineComponent({
  props: {
    challengeType: {type: String, required: true},
  },
  setup(props) {
    const componentStatus = hasComponentStatus('loading');
    const componentSpec = shallowRef<any>(null);

    const viewData = useViewData<{description: string}>();

    async function loadMinigame(challengeType: string) {
      componentStatus.value = "loading";

      let minigameModule;
      try {
        minigameModule = await loadMinigameComponent(challengeType);
      } catch (e) {
        componentStatus.value = "error";
        throw e
      }

      componentSpec.value = minigameModule.default;
      componentStatus.value = "ready";
    }

    watch(() => props.challengeType, loadMinigame, {immediate: true});

    return {
      viewData,
      componentStatus,
      componentSpec,
    };
  },
});
</script>
