<template>
  <div class="mg-toggle-matrix" :style="matrixCss">
    <div class="guide" v-if="false">
      <div class="hint hint-1">
        <i v-for="i of totalFields" :key="i"/>
      </div>
      <div class="hint hint-2">
        <i v-for="i of totalFields" :key="i"/>
      </div>
    </div>

    <div :class="['matrix-field', minigameControls.status]">
      <div v-for="field in minigameData.fields" :key="field.key" class="field" :style="{'--row': field.row, '--col': field.col}">
        <label :class="minigameState.value.toggled[field.key] && 'selected'">
          <input type="checkbox" v-model="minigameState.value.toggled[field.key]">
          <i class="symbol"/>
        </label>
      </div>
      <div class="field" v-for="i of emptyFields" :key="i"/>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"

import {useMinigameData, useViewState} from "@/modules/treasure-hunt/components/minigameData"
import {useMinigameControls} from "@/modules/treasure-hunt/components/minigameData"
import {shuffleFisherYates} from "@/utils/arrays"
import {resolveAfter} from "@/utils/promiseUtils"

type ToggleMatrixViewData = {
  width?: number,
  height?: number,
  fields: {row: number, col: number, label: string, key: string}[],
}
type ToggleMatrixState = {
  toggled: Record<string, boolean>,
}

export default defineComponent({
  setup() {
    const minigameData = useMinigameData<ToggleMatrixViewData>()

    const minigameState = useViewState<ToggleMatrixState>(() => ({
      toggled: {},
    }))

    const clearAll = async () => {
      const active = Object.entries(minigameState.value.toggled)
        .filter(([, value]) => value)
        .map(([name]) => name)
      shuffleFisherYates(active)

      while (active.length) {
        const name = active.shift()!
        delete minigameState.value.toggled[name]
        await resolveAfter(Math.floor(175 + Math.random() * 100))
      }
    }

    const minigameControls = useMinigameControls({
      reset: () => clearAll(),
      getValue: () => solution.value,
    })

    const totalFields = computed(() => (minigameData.value.width || 3) * (minigameData.value.height || 3))
    const emptyFields = computed(() => totalFields.value - minigameData.value.fields.length)
    const solution = computed(() => {
      return minigameData.value.fields
          .filter((field) => minigameState.value.toggled[field.key])
          .map((field) => field.key)
          .join('-');
    })



    const matrixCss = computed(() => ({
      '--matrix-width': minigameData.value.width,
      '--matrix-height': minigameData.value.height,
    }))
    
    return {
      minigameData,
      minigameState,

      emptyFields,
      totalFields,
      matrixCss,

      minigameControls,
    }
  },
});

</script>

<style lang="scss">
@import "~@/sass/vars/colors";

.mg-toggle-matrix {
  --symbol-size: 4em;

  .guide {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    margin-block-end: 1em;

    .hint {
      display: grid;
      grid-template-columns: repeat(var(--matrix-width), 1fr);

      i {
        background: $dim;
        display: block;
        width: 8px;
        height: 8px;
      }
    }

    .hint-1 {
      i:nth-child(2), i:nth-child(9) {
        background: $vivid;
      }
    }

    .hint-2 {
      i:nth-child(4) {
        background: $vivid;
      }
    }
  }

  .matrix-field {
    display: inline-grid;
    grid-template-columns: repeat(var(--matrix-width), minmax(0, 1fr));
    gap: 0.5em;
  }

  .field {
    grid-column: var(--col, auto);
    grid-row: var(--row, auto);

    padding: 8px;

    min-height: 40px;
    min-width: 40px;

    background: rgba(#ccc, 0.25);

    display: flex;
    justify-content: center;
    align-items: center;

    .symbol {
      cursor: pointer;
      width: var(--symbol-size);
      height: var(--symbol-size);
      display: block;
      mask-size: contain;
      mask-image: url("./resources/star.svg");
      background: #666;

      transition: background 0.3s ease;
    }

    input[type=checkbox] {
      display: none;

      &:checked + .symbol {
        background: $vivid;
      }
    }

    > label {
      --color: #ccc;
      &.selected {
        --color: #{$vivid}
      }
    }
  }

  .matrix-field.success {
    .field > label.selected {
      border-color: $earth;
    }
  }
}
</style>
