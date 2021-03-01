<template>
  <div class="mg-toggle-matrix" :style="matrixCss">
    <div class="guide">
      <div class="hint hint-1">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
      <div class="hint hint-2">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
    </div>

    <div :class="['matrix-field', success && 'success']">
      <div v-for="field in fields" :key="field.key" class="field" :style="{'--row': field.row, '--col': field.col}">
        <label :class="matrixValue[field.key] && 'selected'">
          <input type="checkbox" v-model="matrixValue[field.key]">
<!--          <span>{{ field.label }}</span>-->
        </label>
      </div>
      <div class="field"></div>
      <div class="field"></div>
      <div class="field"></div>
      <div class="field"></div>
    </div>

    <div class="matrix-controls">
      <button @click="checkAnswer" :class="['btn', success ? 'btn-success' : 'btn-vivid']">Test</button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {Field} from "./Model/ToggleMatrix";


export default defineComponent({
  props: {
    width: {type: Number, default: 3},
    height: {type: Number, default: 3},
  },
  data() {
    return {
      fields: [
        {row: 1, col: 1, label: 'A', key: 'albatros'},
        {row: 2, col: 1, label: 'B', key: 'boar'},
        {row: 1, col: 2, label: 'C', key: 'cicada'},
        {row: 3, col: 1, label: 'D', key: 'deer'},
        {row: 3, col: 3, label: 'E', key: 'emu'},
      ],
      matrixValue: {},
      success: false,
    };
  },
  computed: {
    matrixCss(): object {
      return {
        '--matrix-width': this.width,
        '--matrix-height': this.height,
      };
    },
  },
  methods: {
    checkAnswer(): void {
      let fields = this.fields as Field[];
      let value = this.matrixValue as { [key: string]: boolean };

      let serialized = fields
          .filter((field) => value[field.key])
          .map((field) => field.key)
          .join('-');

      if (serialized === 'boar-cicada-emu') {
        this.success = true;
        this.$emit('minigameSignal', {
          type: 'success',
        });
      }
    },
  },
});

</script>

<style lang="scss">
@import "~@/sass/vars/colors";

.mg-toggle-matrix {
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

    input[type=checkbox] {
      display: none;
    }

    > label {
      padding: 12px;
      border-top-left-radius: 4px;
      border-bottom-right-radius: 4px;
      background: $dim;

      font-weight: bold;
      border: 2px solid;

      &.selected {
        border-color: $vivid;
      }

      &:not(.selected) {
        border-color: #ccc;
      }
    }
  }

  .matrix-field.success {
    .field > label.selected {
      border-color: $earth;
    }
  }

  .matrix-controls {
    margin-block-start: 1em;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
}
</style>
