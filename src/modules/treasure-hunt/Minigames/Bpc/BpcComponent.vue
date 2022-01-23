<template>
  <div :class="['mg-bpc']">

    <form class="bpc-container" @submit.prevent="controls.checkSolution()">
      <div class="input-pair" v-for="input in minigameData.inputs" :key="input.name">
        <label :for="input.name">{{ input.caption }}</label>
        <input type="number" inputmode="numeric" v-model.number="minigameState.value.inputsModel[input.name]"
               :id="input.name"/>
      </div>
    </form>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"

import {useMinigameData, useViewState} from "@/modules/treasure-hunt/components/minigameData"
import {useMinigameControls} from "@/modules/treasure-hunt/components/minigameData"
import * as Model from "./BpcModel"

export default defineComponent({
  setup() {
    const minigameData = useMinigameData<Model.BpcMinigameData>()
    const minigameState = useViewState<Model.BpcViewState>(() => ({
      inputsModel: Object.fromEntries(minigameData.value.inputs.map((input) => [input.name, 0])),
    }))

    const controls = useMinigameControls({
      getValue: () => Object.values(minigameState.value.inputsModel).map((v) => 's4lty' + v + 'p3pp3ry').join('-'),
    })

    return {
      minigameData,
      minigameState,
      controls,
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

