<template>
  <div class="mg-cp">
    <div class="prompt-box" v-for="(prompt, i) in prompts" :key="i">
      <div class="prompt">
        <img :src="'/minigames/shamans/' + prompt.img" :alt="'Výzva ' + i">
      </div>

      <div class="options">
        <button v-for="option in prompt.options" :key="option"
                :class="['btn', state.value.selections[i] === option ? 'btn-success' :'btn-bland']"
                @click="setPromptValue(i, option)">
          {{option}}
        </button>
      </div>
    </div>

    <MinigameControls :reset="state.reset" :check-solution="checkSolution"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, watch} from "vue"
import {hashCode} from "@/utils/stringUtils"

import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue"

import {ComboPickState, ComboPickViewData} from "./ComboPickModel"

export default defineComponent({
  components: {
    MinigameControls,
  },
  setup() {
    const viewData = useViewData<ComboPickViewData>()
    const prompts = computed(() => viewData.value.prompts)

    const state = useViewState<ComboPickState>(() => ({
      selections: prompts.value.map(() => undefined),
    }))
    const solutionHash = computed(() => hashCode(state.value.selections.join('--')))
    const controls = useMinigameControls()

    watch(() => viewData, (data) => console.log("view data", data), {immediate: true})

    return {
      state,
      prompts,
      setPromptValue: (i: number, value: string) => state.value.selections[i] = value,
      checkSolution: () => controls.checkSolution(solutionHash.value),
    }
  },
})
</script>

<style lang="scss">
.mg-cp {
  .prompt-box {
    display: flex;

    .prompt {
      height: 6em;
      flex: 1;

      img {
        max-height: 100%;
      }
    }

    .options {
      flex: 1;

      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      justify-content: center;
      align-items: center;
    }
    .btn {
      padding: 0.75em;
      width: 33%;
    }

    &:not(:first-child) {
      margin-top: 1em;
    }
  }
}
</style>
