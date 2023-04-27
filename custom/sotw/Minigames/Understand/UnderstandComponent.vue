<script lang="ts" setup>
import { PropType, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import UnderstandApi from "./UnderstandApi";
import VocabularyEntry from "./Model/VocabularyEntry";
import { useGameLoop } from "@src/modules/treasure-hunt/components/gameLoop"
import { exposeMinigameControls, minigameEmits } from "@src/modules/treasure-hunt/components/minigameData"
import { useUnderstandController } from "./understandVueController"

const emit = defineEmits({
  ...minigameEmits,
})
type UnderstandComponentConfig = {
  wordsPerRound: number,
  optionsPerWord: number,
  stepTimeLimit: number,

  wordsPreset?: string,
  inputMode?: 'button' | 'picture',
}
const props = defineProps({
  challengeConfig: {type: Object as PropType<UnderstandComponentConfig>, required: true},
})

const ctrl = useUnderstandController(props.challengeConfig, emit)

const gameLoop = useGameLoop(24, (t, dt) => ctrl.updateTimeLimit(t, dt))
exposeMinigameControls({
  reset: () => ctrl.beginAttempt(),
}, emit)

onMounted(async () => {
  let words = await UnderstandApi.loadVocabulary(props.challengeConfig.wordsPreset)
  ctrl.vocabulary.value = words

  gameLoop.start()

})
onBeforeUnmount(() => {
  gameLoop.stop()
})

</script>

<template>
  <div class="mg -understand">
    <template v-if="ctrl.gameState.value === 'idle'">
      <button class="btn -acc-primary" @click.prevent="ctrl.beginAttempt">Začít</button>
    </template>

    <div class="play-area" :class="ctrl.gameState.value" v-else>
      <div class="current-word" v-if="ctrl.currentWord.value">
        <div class="current-step">{{ ctrl.round.currentStep }} / {{ challengeConfig.wordsPerRound }}</div>
        <div class="img-wrapper">
          <img :src="ctrl.currentWord.value.pictureUrl" alt="Neznámé slovo">
        </div>
      </div>

      <div class="understand-options -picture" v-if="challengeConfig.inputMode === 'picture'">
        <button v-for="(option, i) in ctrl.round.optionIndices" :key="i" class="btn" @click="ctrl.selectOption(option)">
          <img :src="ctrl.vocabulary.value[option].pictureUrl" alt="" />
      </button>
      </div>
      <div class="understand-options" v-else>
        <button v-for="(option, i) in ctrl.round.optionIndices" :key="i" class="btn" @click="ctrl.selectOption(option)">{{
          ctrl.vocabulary.value[option].word }}</button>
      </div>
    </div>

    <div class="progressbar">
      <div class="chunk -acc-primary" :style="'--done: ' + ctrl.remainingTimePct.value + ';'"></div>
    </div>
  </div>
</template>

<style lang="scss">
.mg.-understand {
  .play-area {
    display: flex;
    flex-direction: column;
    gap: 1em;

    transition: filter 0.3s;

    &.failed {
      filter: saturate(0.2) brightness(0.8);
    }

    &.won {
      filter: saturate(0.8) brightness(1.2);
    }

    &:not(.started) {
      .understand-options {
        pointer-events: none;
      }
    }
  }

  .progressbar {
    margin-top: 1rem;
  }

  .current-word {
    display: grid;
    place-content: stretch;
    min-height: 10rem;

    >* {
      grid-area: 1 / 1;
    }

    .current-step {
      place-self: end start;

      padding: 0.25rem 0.5rem;
      z-index: 2;

      font-size: 2rem;

      background: var(--neutral-950);
    }

    .img-wrapper {
      flex: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      min-height: 10rem;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }

  .understand-options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.1em;

    justify-content: space-evenly;
    align-items: center;

    > button {
      padding: 0.50em 1.25em;
      font-weight: bold;

      cursor: pointer;
    }

    &.-picture {
      flex-wrap: nowrap;
      justify-content: center;

      button {
        box-shadow: inset 0 0 0.5em 2em white;
        max-height: 20vh;

        img {
          max-width: 100%;
          max-height: 19vh;
        }
      }
    }
  }
}
</style>
