<template>
  <div class="mg-mix-match">
    <p class="guide">{{ guide }}</p>

    <div class="pieces">
      <template v-for="(piece, i) in pieces" :key="i">
        <div :class="['piece', 'piece-' + piece.type, i === selectedPiece && setupOpen && 'piece-selected']"
             :style="{'--color': piece.color, '--modelImage': getPieceImage(piece)}"
             @click="selectPiece(i)"></div>
      </template>
    </div>

    <div :class="['setup', selectedPiece !== -1 && setupOpen && 'setup-open']">
      <template v-if="true">
        <div class="controls">
          <i class="close" @click="selectPiece(-1)">x</i>
        </div>

        <div class="attribute start colors">
          <div class="option" v-for="option in colorOptions" :key="option"
               :style="{'--color': option.color}" @click="pieces[selectedPiece].color = option.color"></div>
        </div>

        <div class="attribute end models">
          <div class="option" v-for="option in modelOptions" :key="option"
               :style="{'--image': getModelImage(option.name)}" @click="pieces[selectedPiece].model = option.name"></div>
        </div>
      </template>
    </div>

    <div class="mg-controls">
      <button class="btn btn-vivid" @click="checkTotem">Vzykoušet</button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from "vue";
import {hashCode} from "@/utils/stringUtils";

type MixPieceType = 'head' | 'body' | 'leg';
type MixPieceModelOption = {name: string, image: string};

type MixPiece = {
  type: MixPieceType
  color: string,
  model: string,
}

export default defineComponent({
  setup(props, {emit}) {
    let guide = ref("P#-B&-Y$");
    const pieceOptions = ref<{[pieceType: string]: MixPieceModelOption[]}>({
      head: [
        {name: 'owl', image: 'A1.png'},
        {name: 'hawk-light', image: 'A3.png'},
        {name: 'hawk-dark', image: 'A4.png'},
      ],
      body: [
        {name: 'gorilla', image: 'B1.png'},
        {name: 'bass', image: 'B2.png'},
        {name: 'goldfish', image: 'B3.png'},
        {name: 'fright', image: 'B4.png'},
        {name: 'peacock', image: 'B5.png'},
        {name: 'wuff', image: 'B6.png'},
        {name: 'frog', image: 'B7.png'},
      ],
      leg: [
        {name: 'felid', image: 'C1.png'},
        {name: 'swan', image: 'C2.png'},
        {name: 'walrus', image: 'C3.png'},
      ],
    });

    const pieces = ref([
      {type: 'head', color: 'gray', model: 'hawk-light'},
      {type: 'body', color: 'dimgray', model: 'bass'},
      {type: 'body', color: 'lightgray', model: 'wuff'},
      {type: 'body', color: 'darkgray', model: 'gorilla'},
      {type: 'leg', color: 'darkgray', model: 'swan'},
    ] as MixPiece[]);

    const colorOptions = ref([
      {color: 'deeppink', label: 'P'},
      {color: 'yellow', label: 'Y'},
      {color: 'red', label: 'R'},
      {color: 'dodgerblue', label: 'B'},
      {color: 'green', label: 'G'},
    ]);

    const selectedPiece = ref(-1);
    const setupOpen = ref(false);

    const modelOptions = computed(() => {
      if (selectedPiece.value === -1) {
        return [];
      }

      let modelType = pieces.value[selectedPiece.value].type;
      return pieceOptions.value[modelType];
    })

    let colorToLabel = (color: string): string => {
      let option = colorOptions.value.find((opt) => opt.color === color);
      return option?.label || 'nada';
    };
    const getPieceImage = (piece: MixPiece): string | undefined => {
      let option = pieceOptions.value[piece.type].find((option) => option.name === piece.model)
      return option ? 'url("/minigames/totems/' + option.image +'")' : undefined;
    }

    let piecesSerialized = computed(() => pieces.value.map((piece) => colorToLabel(piece.color) + piece.model).join('-'));

    return {
      guide,
      pieces,
      setupOpen,
      selectedPiece,
      colorOptions,
      modelOptions,
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
        let option = modelOptions.value.find((model) => model.name === modelName);
        return option ? 'url("/minigames/totems/' + option.image +'")' : undefined;
      },
      checkTotem: () => {
        const check = hashCode(piecesSerialized.value);
        if (check === '6ed6f1ea') {
          emit('minigameSignal', {
            type: 'success',
          });
        }
      },
    };
  },
});
</script>

<style lang="scss">
.mg-mix-match {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.25em;

  .guide {
    border-bottom: 1px solid lightgray;
    padding-bottom: 6px;
    margin: 0 8px;
  }

  .pieces {
    grid-row: 2; grid-column: 1;
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

    grid-row: 2; grid-column: 1;

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
          width: 36px;
          height: 24px;
          border-radius: 8px;
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
