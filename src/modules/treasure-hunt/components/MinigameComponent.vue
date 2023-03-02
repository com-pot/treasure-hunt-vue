<template>
  <LoadingIndicator label="Probíhá příprava výzvy..." v-if="componentStatus.status === 'loading'"/>

  <template v-else-if="componentStatus.status === 'ready' && componentSpec">
    <component v-if="componentMode === 'di'"
               :is="componentSpec" v-bind="$attrs"
    />
    <component v-else
               :is="componentSpec" :challenge-config="challengeConfig"
               v-bind="$attrs"
    />
  </template>

  <template v-else>Jejda?</template>
</template>

<script lang="ts">
import {computed, defineComponent, shallowRef, watch} from "vue";
import {loadMinigameComponent} from "@src/modules/treasure-hunt/utils/minigameUtils"
import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"

export default defineComponent({
  components: {LoadingIndicator},
  inheritAttrs: false,

  props: {
    challengeType: {type: String, required: true},
    challengeConfig: {type: Object},
  },

  setup(props) {
    const componentStatus = useAsyncIndicator('loading');
    const componentSpec = shallowRef<any>(null);
    const componentMode = computed(() => componentSpec.value?.props?.challengeConfig ? 'prop' : 'di')

    const loadMinigame = (challengeType: string) => componentStatus.awaitTask(async () => {
      componentSpec.value = await loadMinigameComponent(challengeType)
    })

    watch(() => props.challengeType, loadMinigame, {immediate: true});

    return {
      componentStatus,
      componentSpec,
      componentMode,
    };
  },
});
</script>
