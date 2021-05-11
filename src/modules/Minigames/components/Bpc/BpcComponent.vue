<template>
  <div :class="['mg-bpc']">

    <form class="bpc-container" @submit.prevent="checkValues">
      <div class="input-pair" v-for="input in inputs" :key="input.name">
        <label :for="input.name">{{ input.caption }}</label>
        <input type="number" inputmode="numeric" v-model.number="inputsModel[input.name]"
               :id="input.name"/>
      </div>

      <div class="input-pair input-pair-full input-pair-center">
        <label>&nbsp;</label>
        <button type="submit" class="btn btn-vivid">Check</button>
      </div>
    </form>

  </div>
</template>

<script lang="ts">
import {defineComponent, toRef} from "vue"
import {hashCode} from "@/utils/stringUtils";
import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"

import * as Model from "./BpcModel"
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"

export default defineComponent({
  setup() {
    const minigameData = useViewData<Model.BpcMinigameData>()
    const inputs = toRef(minigameData.value, 'inputs')

    const minigameState = useViewState<Model.BpcViewState>(() => ({
      inputsModel: Object.fromEntries(inputs.value.map((input) => [input.name, 0])),
    }))

    const inputsModel = toRef(minigameState.value, 'inputsModel')
    const controls = useMinigameControls()

    return {
      inputs,
      inputsModel,
      checkValues() {
        let valueSerialized = Object.values(inputsModel.value).map((v) => 's4lty' + v + 'p3pp3ry').join('-');
        controls.checkSolution(hashCode(valueSerialized).substr(0, 6))
      },
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

