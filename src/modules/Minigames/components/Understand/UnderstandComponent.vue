<template>
  <div class="mg-understand">
    <template v-if="gameState === 'idle'">
      <button class="btn btn-vivid" @click.prevent="beginAttempt">Začít</button>
    </template>

    <div class="play-area" :class="gameState" v-else>
      <div class="current-word" v-if="currentWord">
        <div>{{round.currentStep}} / {{wordsPerRound}}</div>
        <div class="img-wrapper">
          <img :src="currentWord.pictureUrl" alt="Neznámé slovo">
        </div>
      </div>

      <div class="understand-options">
        <span v-for="(option, i) in round.optionIndices" :key="i" class="btn btn-vivid"
              @click="selectOption(option)">{{ vocabulary[option].word }}</span>
      </div>
    </div>

    <div class="progressbar">
      <div class="chunk -vivid" :style="'--done: ' + remainingTimePct + ';'"></div>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import arrays from "@/utils/arrays";

import UnderstandApi from "./UnderstandApi";
import VocabularyEntry from "./Model/VocabularyEntry";
import {useGameLoop} from "@/modules/Minigames/utils/gameLoop"
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"

export default defineComponent({
  props: {
    wordsPerRound: {
      type: Number,
      default: 3,
    },
    optionsPerWord: {
      type: Number,
      default: 4,
    },
    stepTimeLimit: {
      type: Number,
      default: 6.6,
    },
  },
  data() {
    return {
      gameLoop: useGameLoop(24, (t, dt) => this.updateTimeLimit(t, dt)),
      controls: useMinigameControls({
        reset: () => this.beginAttempt(),
      }),
      gameState: 'idle',
      vocabulary: [] as VocabularyEntry[],
      round: {
        currentStep: -1,
        wordIndices: [] as number[],
        currentWordIndex: -1,
        optionIndices: [] as number[],
      },
      step: {
        remainingTime: 0,
      },
      tickInterval: -1,
    };
  },
  computed: {
    isReady(): boolean {
      return this.vocabulary.length > 0;
    },
    currentWordIndex(): number {
      let number = this.round.wordIndices[this.round.currentStep]
      if (typeof number === "undefined") {
        number = this.round.wordIndices[this.round.currentStep - 1]
      }

      return number
    },
    currentWord(): VocabularyEntry {
      return this.vocabulary[this.currentWordIndex];
    },
    remainingTimePct(): number {
      return this.step.remainingTime / this.stepTimeLimit;
    },
  },
  methods: {
    startRound() {
      let indices = this.vocabulary.map((entry, i) => i) as number[];
      arrays.shuffleFisherYates(indices);
      this.round.wordIndices = indices.slice(0, this.wordsPerRound);
      this.round.currentStep = 0;
      this.initializeOptions();
    },
    initializeOptions() {
      if (!this.vocabulary || this.round.currentStep === -1) {
        console.log("No updato");
        return;
      }
      let indices = this.vocabulary.map((entry, i) => i) as number[];
      let optionIndices = arrays.shuffleFisherYates(indices).slice(0, this.optionsPerWord);
      if (!optionIndices.includes(this.currentWordIndex)) {
        let i = Math.floor(Math.random() * optionIndices.length);
        optionIndices[i] = this.currentWordIndex;
      }
      this.round.optionIndices = optionIndices;
      this.step.remainingTime = this.stepTimeLimit;
    },
    selectOption(option: number) {
      if (option !== this.currentWordIndex) {
        this.endAttempt('failed')
        return
      }

      this.nextStep()
    },
    nextStep() {
      this.round.currentStep++;
      if (this.round.currentStep === this.wordsPerRound) {
        this.endAttempt('won')
      } else {
        this.initializeOptions();
      }
    },
    updateTimeLimit(t: number, dt: number) {
      this.step.remainingTime -= dt * 0.001;
      if (this.step.remainingTime <= 0) {
        this.step.remainingTime = 0
        this.endAttempt('failed')
      }
    },

    beginAttempt() {
      this.startRound()
      this.gameState = 'started'
      !this.gameLoop.redrawInterval && this.gameLoop.start()
    },
    endAttempt(state: string) {
      this.gameLoop.stop()
      this.gameState = state

      this.controls.checkSolution('' + this.round.currentStep)
    },
  },
  mounted() {
    UnderstandApi.loadVocabulary()
        .then((entries) => this.vocabulary = entries)
  },
  beforeUnmount() {
    this.gameLoop.stop()
  },
});
</script>

<style lang="scss">
@import "~@/sass/vars/colors";

.mg-understand {
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
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .img-wrapper {
      flex: 1;

      display: flex;
      align-items: center;
      justify-content: center;

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

    > span {
      padding: 0.50em 1.25em;
      font-weight: bold;

      cursor: pointer;
    }
  }
}
</style>
