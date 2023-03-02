<template>
  <div :class="['mg-bpc']">

    <form class="bpc-container" @submit.prevent="$emit('check-solution')">
      <div class="input-pair" v-for="input in challengeConfig.inputs" :key="input.name">
        <label :for="input.name">{{ input.caption }}</label>
        <input type="number" inputmode="numeric" v-model.number="minigameState.value.inputsModel[input.name]"
               :id="input.name"/>
      </div>
      <button style="display: none"/>
    </form>

  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue"

import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import * as Model from "./BpcModel"

export default defineComponent({
  emits: ['check-solution'],
  props: {
    challengeConfig: {type: Object as PropType<Model.BpcMinigameData>, required: true},
  },
  setup(props, {emit}) {
    const minigameState = useViewState<Model.BpcViewState>(() => ({
      inputsModel: Object.fromEntries(props.challengeConfig.inputs.map((input) => [input.name, 0])),
    }))

    exposeMinigameControls({
      getValue: () => Object.values(minigameState.value.inputsModel).map((v) => 's4lty' + v + 'p3pp3ry').join('-'),
    }, emit)

    return {
      minigameState,
    };
  },
});

</script>

<style lang="scss">
.mg-bpc {
  .bpc-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 0.25em;

    .input-pair {
      flex: 0 1 120px;
      //min-width: 120px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &.input-pair-full {
        flex: 1 0 100%;
      }

      &.input-pair-center {
        align-items: center;
      }

      input {
        align-self: stretch;
      }
    }
  }
}
</style>

