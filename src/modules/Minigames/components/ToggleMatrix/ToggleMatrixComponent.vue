<template>
  <div class="mg-toggle-matrix" :style="matrixCss">
    <div class="guide">
      <div class="hint hint-1">
        <i/><i/><i/>
        <i/><i/><i/>
        <i/><i/><i/>
      </div>
      <div class="hint hint-2">
        <i/><i/><i/>
        <i/><i/><i/>
        <i/><i/><i/>
      </div>
    </div>

    <div :class="['matrix-field', minigameControls.result]">
      <div v-for="field in fields" :key="field.key" class="field" :style="{'--row': field.row, '--col': field.col}">
        <label :class="minigameState.value.toggled[field.key] && 'selected'">
          <input type="checkbox" v-model="minigameState.value.toggled[field.key]">
          <i class="symbol"/>
        </label>
      </div>
      <div class="field"></div>
      <div class="field"></div>
      <div class="field"></div>
      <div class="field"></div>
    </div>

    <MinigameControls :check-solution="checkAnswer" :reset="minigameState.reset" :success="minigameControls.result === 'success'"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"

import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue"
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"

type ToggleMatrixViewData = {
  fields: {row: number, col: number, label: string, key: string}[],
}
type ToggleMatrixState = {
  toggled: {[name: string]: string},
}

export default defineComponent({
  components: {MinigameControls},
  props: {
    width: {type: Number, default: 3},
    height: {type: Number, default: 3},
  },
  setup(props) {
    const minigameData = useViewData<ToggleMatrixViewData>()
    const fields = computed(() => minigameData.value.fields)

    const minigameState = useViewState<ToggleMatrixState>(() => ({
      toggled: {},
    }))
    const solution = computed(() => {
      return fields.value
          .filter((field) => minigameState.value.toggled[field.key])
          .map((field) => field.key)
          .join('-');
    })

    const minigameControls = useMinigameControls()

    const matrixCss = computed(() => ({
      '--matrix-width': props.width,
      '--matrix-height': props.height,
    }))
    
    return {
      fields,
      minigameState,

      matrixCss,

      minigameControls,
      checkAnswer() {
        minigameControls.checkSolution(solution.value)
      },
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
      grid-template-columns: repeat(3, 1fr);

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
