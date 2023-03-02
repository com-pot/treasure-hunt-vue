<template>
  <div class="mg-cp">
    <div class="prompts" v-if="challengeConfig.prompts && challengeConfig.options">
      <div class="prompt-row legend">
        <div class="general">Běžný význam</div>
        <div class="prompt">Lapač</div>
        <div class="war">Význam v boji</div>
      </div>

      <div class="prompt-row" v-for="(prompt, i) in prompts" :key="i">
        <ComboPickInput :options="challengeConfig.options.default" v-model="state.value.selections[i][0]"
                        class="general" mode="select"/>

        <div class="prompt" :style="'--color: ' + prompt.color"></div>

        <ComboPickInput :options="challengeConfig.options.war" v-model="state.value.selections[i][1]"
                        class="war" mode="select"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"

import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"

import {ComboPickViewData, initializeState} from "./ComboPickModel"
import ComboPickInput from "./ComboPickInput.vue"


export default defineComponent({
  components: {
    ComboPickInput,
  },
  props: {
    challengeConfig: {type: Object as PropType<ComboPickViewData>, required: true},
  },
  setup(props, {emit}) {
    const prompts = computed(() => props.challengeConfig.prompts)

    const state = useViewState(initializeState)

    exposeMinigameControls({
      reset: () => state.reset(props.challengeConfig),
      getValue: () => state.value.selections.join('--'),
    }, emit)

    return {
      state,
      prompts,
    }
  },
})
</script>

<style lang="scss">
@import "../../../../src/modules/Layout/scss/breakpoints";

.mg-cp {
  .prompts {
    .legend {
      padding: 0.2em;
      border-radius: 0.5em;
      border: 2px solid #e69833;
    }

    .combo-pick-input {
      max-height: 6em;
    }

    .btn {
      padding: 0.75em 0.25em;
    }
  }

  .prompt-row {

    &:not(:first-child) {
      margin-block-start: 1em;
    }

    &:not(.legend) {
      .prompt {
        height: 6em;
        width: 6em;

        mask-image: url('/minigames/dream-mean/dreamcatcher.svg');
        mask-repeat: no-repeat;
        mask-position: center;
        background-color: var(--color, black);
      }
    }

    @include md('lt') {
      display: grid;
      gap: 0.5em 1em;

      grid-template-columns: 6em 1fr;

      .prompt {
        grid-column: 1;
        grid-row: 1 / span 2;
        place-self: center;
      }
    }

    @include sm('lt') {
      grid-template-columns: 1fr;
      .prompt {
        grid-row: 1;
      }
    }

    @include md() {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      gap: 0.5em;

      .multiselect {
        width: unset;
        flex: 1;
      }
    }
  }
}
</style>
