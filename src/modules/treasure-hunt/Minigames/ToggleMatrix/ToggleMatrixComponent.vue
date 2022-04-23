<template>
  <div class="mg-toggle-matrix" :style="matrixCss">
    <div class="matrix-field">
      <div v-for="field in challengeConfig.fields" :key="field.key"
           class="field" :class="minigameState.value.toggled[field.key] && 'selected'"
           :style="[`--row: ${field.row}`, `--col: ${field.col}`]"
      >
        <label>
          <input type="checkbox" v-model="minigameState.value.toggled[field.key]">
          <i class="symbol"/>
        </label>
      </div>
      <div class="field" v-for="i of emptyFields" :key="i"/>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"

import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import {shuffleFisherYates} from "@src/utils/arrays"
import {resolveAfter} from "@src/utils/promiseUtils"

type ToggleMatrixViewData = {
  width?: number,
  height?: number,
  fields: {row: number, col: number, label: string, key: string}[],
}
type ToggleMatrixState = {
  toggled: Record<string, boolean>,
}

export default defineComponent({
  props: {
    challengeConfig: {type: Object as PropType<ToggleMatrixViewData>, required: true},
  },
  setup(props, {emit}) {
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

    exposeMinigameControls({
      reset: () => clearAll(),
      getValue: () => solution.value,
    }, emit)

    const totalFields = computed(() => (props.challengeConfig.width || 3) * (props.challengeConfig.height || 3))
    const emptyFields = computed(() => totalFields.value - props.challengeConfig.fields.length)
    const solution = computed(() => {
      return props.challengeConfig.fields
          .filter((field) => minigameState.value.toggled[field.key])
          .map((field) => field.key)
          .join('-');
    })



    const matrixCss = computed(() => ([
      '--matrix-width:' + props.challengeConfig.width,
      '--matrix-height:' + props.challengeConfig.height,
    ]))
    
    return {
      minigameState,

      emptyFields,
      totalFields,
      matrixCss,
    }
  },
});

</script>

<style lang="scss">
.mg-toggle-matrix {
  --symbol-size: 4em;
  --inactive-color: var(--neutral-500);
  --active-color: var(--hsl-vivid);

  .matrix-field {
    display: inline-grid;
    grid-template-columns: repeat(var(--matrix-width), minmax(0, 1fr));
    gap: 0.5em;
  }

  .field {
    --color: var(--inactive-color);
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
      background-color: var(--color);

      transition: background-color 0.3s ease;
    }

    input[type=checkbox] {
      display: none;
    }

    &.selected {
      --color: var(--active-color);
    }
  }
}
</style>
