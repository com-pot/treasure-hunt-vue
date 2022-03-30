<template>
  <div class="mg-mix-match">
    <div class="pieces">
      <template v-for="(piece, i) in internalState.value.pieces" :key="i">
        <div :class="['piece', 'piece-' + piece.type, i === selectedPiece && setupOpen && 'piece-selected']"
             :style="['--color:'+ piece.color, '--modelImage:'+ getPieceImage(piece)]"
             @click="selectPiece(i)"></div>
      </template>
    </div>

    <div :class="['setup', selectedPiece !== -1 && setupOpen && 'setup-open']">
      <template v-if="true">
        <div class="controls">
          <i class="close" @click="selectPiece(-1)">x</i>
        </div>

        <div class="attribute start colors">
          <div class="option" v-for="option in colorOptions" :key="option.color"
               :style="'--color:'+ option.color" @click="internalState.value.pieces[selectedPiece].color = option.color"></div>
        </div>

        <div class="attribute end models">
          <div class="option" v-for="option in selectedPieceModelOptions" :key="option.name"
               :style="'--image:'+ getModelImage(option.name)" @click="internalState.value.pieces[selectedPiece].model = option.name"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue"

import * as Model from "./MixMatchModel"
import {useMinigameData, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import {useMinigameControls} from "@src/modules/treasure-hunt/components/minigameData"


export default defineComponent({
  inheritAttrs: false,
  setup() {
    const minigameData = useMinigameData<Model.MixMatchMinigameData>()
    const pieceOptions = computed(() => minigameData.value.modelOptions)
    const colorOptions = computed(() => minigameData.value.colorOptions)

    const internalState = useViewState<Model.MixMatchViewState>(() => ({
      pieces: [
        {type: 'head', color: 'gray', model: 'hawk-light'},
        {type: 'body', color: 'dimgray', model: 'bass'},
        {type: 'body', color: 'lightgray', model: 'wuff'},
        {type: 'body', color: 'darkgray', model: 'gorilla'},
        {type: 'leg', color: 'darkgray', model: 'swan'},
      ]
    }))

    useMinigameControls({
      getValue: () => piecesSerialized.value,
      reset: () => internalState.reset(minigameData),
    })

    const selectedPiece = ref(-1);
    const setupOpen = ref(false);

    const selectedPieceModelOptions = computed<Model.ModelOption[]>(() => {
      if (selectedPiece.value === -1) {
        return [];
      }

      let modelType = internalState.value.pieces[selectedPiece.value].type;
      return pieceOptions.value[modelType];
    })

    let colorToLabel = (color: string): string => {
      let option = colorOptions.value.find((opt) => opt.color === color);
      return option?.label || 'nada';
    };
    const getPieceImage = (piece: Model.MixPiece): string | undefined => {
      const options = pieceOptions.value[piece.type] as Model.ModelOption[]
      let option = options.find((option) => option.name === piece.model)
      return option ? 'url("/minigames/totems/' + option.image +'")' : undefined;
    }

    const piecesSerialized = computed(() => internalState.value.pieces.map((piece) => colorToLabel(piece.color) + piece.model).join('-'));

    return {
      internalState,
      setupOpen,
      selectedPiece,
      colorOptions,
      selectedPieceModelOptions,
      selectPiece: (i: number) => {
        if (i === selectedPiece.value) {
          return
        }
        if (selectedPiece.value === -1) {
          setupOpen.value = true;
          selectedPiece.value = i;
          return;
        }
        setupOpen.value = false;
        setTimeout(() => {
          selectedPiece.value = i;
          setupOpen.value = true;
        }, 350);
      },
      getPieceImage,
      getModelImage: (modelName: string): string|undefined => {
        let option = selectedPieceModelOptions.value.find((model) => model.name === modelName);
        return option ? 'url("/minigames/totems/' + option.image +'")' : undefined;
      },
    };
  },
});
</script>

<style lang="scss">
.mg-mix-match {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 0.25em;

  .pieces {
    grid-row: 1; grid-column: 1;
    margin-top: 24px;
    margin-bottom: 24px;

    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    background: white;
    box-shadow: 0 0 12px 16px white;
  }

  .piece {
    $pieceScale: 0.7;
    $pieceSizes: 'head' 472px 225px, 'body' 126px 140px, 'leg' 165px 198px;

    background-color: var(--color);
    background-image: var(--modelImage);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

    @each $type, $width, $height in $pieceSizes {
      &-#{$type} {
        width: $width * $pieceScale;
        height: $height * $pieceScale;
      }
    }

    &.piece-selected {
      position: relative;
      animation: pulseSpacing 1s infinite;

      &:before, &:after {
        position: absolute;
        content: '';
        display: block;
        height: 100%;
        width: 2px;
        background: black;

        transition: left 0.5s ease, right 0.5s ease;
      }
      &:before {
        left: var(--spacing);
      }
      &:after {
        right: var(--spacing);
      }
    }
  }

  .setup {
    margin-top: 24px;
    margin-bottom: 24px;

    grid-row: 1; grid-column: 1;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;

    opacity: 1;
    transition: opacity 0.3s ease;

    overflow: hidden;

    &:not(.setup-open) {
      opacity: 0;
      pointer-events: none;

      .attribute {
        --openOffset: -33%;
      }
    }

    .controls {
      width: 100%;
      height: 1em;
      margin: 4px;
      text-align: right;
    }

    .attribute {
      --openOffset: 0;
      align-self: flex-end;
      width: 33%;
      max-height: 400px;

      transition: margin 0.3s ease;

      .option {
        height: 60px;
        cursor: pointer;
      }

      &.models {
        overflow-y: scroll;

        .option {
          height: 80px;

          background-image: var(--image);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;

          &:not(:first-child) {
            margin-block-start: 0.5em;
          }
        }
      }

      &.colors {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-content: flex-start;

        margin-inline-end: -0.2em;

        .option {
          margin-block-end: 0.2em;
          margin-inline-end: 0.2em;
          width: 2.5em;
          height: 1.25em;
          border-radius: 0.75em;
          background: var(--color);
        }
      }

      &.start {
        margin-inline-start: var(--openOffset);
      }
      &.end {
        margin-inline-end: var(--openOffset);
      }
    }
  }
}

@keyframes pulseSpacing {
  0% {
    --spacing: -6px;
  }
  100% {
    --spacing: -12px;
  }
}
</style>
