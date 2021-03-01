<template>
  <div class="mg-mix-match">
    <p class="guide">{{ guide }}</p>

    <div class="pieces">
      <template v-for="(piece, i) in pieces" :key="i">
        <div class="piece" :style="{'--color': piece.color}" @click="selectedPiece = i">
          <span>{{ piece.symbol }}</span>
        </div>
        <div class="spacer"/>
      </template>
    </div>

    <div :class="['setup', selectedPiece !== -1 && 'setup-open']">
      <p v-if="selectedPiece === -1">Select a piece to adjust</p>
      <template v-else>
        <div class="controls">
          <i class="close" @click="selectedPiece = -1">x</i>
        </div>

        <div class="attribute colors">
          <div class="option" v-for="option in colorOptions" :key="option"
               :style="{'--color': option.color}" @click="pieces[selectedPiece].color = option.color"></div>
        </div>

        <div class="attribute symbols">
          <div class="option" v-for="option in symbolOptions" :key="option"
               @click="pieces[selectedPiece].symbol = option">{{ option }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from "vue";

type MixPiece = {
  color: string,
  symbol: string,
}

export default defineComponent({
  setup(props, {emit}) {
    let guide = ref("P#-B&-Y$");
    let pieces = ref([
      {color: 'gray', symbol: '0'},
      {color: 'dimgray', symbol: '0'},
      {color: 'darkgray', symbol: '0'},
    ] as MixPiece[]);

    let colorOptions = ref([
      {color: 'deeppink', label: 'P'},
      {color: 'yellow', label: 'Y'},
      {color: 'red', label: 'R'},
      {color: 'dodgerblue', label: 'B'},
      {color: 'green', label: 'G'},
    ]);
    let symbolOptions = ref([
      '#', '@', '&', '%', '$',
    ]);
    let selectedPiece = ref(-1);

    let colorToLabel = (color: string): string | undefined => {
      let option = colorOptions.value.find((opt) => opt.color === color);
      return option?.label || 'nada';
    };

    let piecesSerialized = computed(() => pieces.value.map((piece) => colorToLabel(piece.color) + piece.symbol).join('-'));
    watch(() => piecesSerialized.value, (serialized) => {
      if (serialized === guide.value) {
        emit('minigameSignal', {
          type: 'success',
        });
      }
    });

    return {
      guide,
      pieces,
      selectedPiece,
      colorOptions,
      symbolOptions,
    };
  },
});
</script>

<style lang="scss">
.mg-mix-match {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 3fr);
  gap: 0.25em;

  .guide {
    grid-column: 1 / span 2;
    border-bottom: 1px solid lightgray;
    padding-bottom: 6px;
    margin: 0 8px;
  }

  .pieces {
    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    .piece {
      width: 64px;
      height: 80px;
      border-radius: 10%;

      border-bottom: 6px solid saddlebrown;
      border-right: 2px solid saddlebrown;

      cursor: pointer;
      background: sandybrown;
      color: var(--color);

      display: grid;
      align-content: center;

      font-size: 20pt;
      font-weight: bold;
    }

    .spacer {
      width: 40px;
      height: 2px;
      background: saddlebrown;

      &:last-child {
        height: 8px;
      }
    }
  }

  .setup.setup-open {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0.5em;

    .controls {
      grid-column: 1 / span 2;

      margin: 4px;
      text-align: right;

    }

    .attribute {
      display: flex;
      flex-direction: column;
      gap: 0.1em;
      justify-content: space-evenly;

      .option {
        height: 60px;
        border-radius: 10%;
        display: grid;
        align-content: center;

        cursor: pointer;
      }

      &.symbols {
        .option {
          background: rgba(#EEE, 0.8);
          font-size: 16pt;
          font-weight: bold;
        }
      }

      &.colors {
        .option {
          background: var(--color);
        }
      }
    }
  }
}
</style>
