<template>
  <div class="mg-understand">
    <div class="play-area">
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
    <div class="time-limit" :style="'--remainingPct: ' + remainingTimePct + '%'">
      <div class="bar"></div>
      <span class="label">{{step.remainingTime.toFixed(1)}}</span>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import arrays from "@/utils/arrays";

import UnderstandApi from "./UnderstandApi";
import VocabularyEntry from "./Model/VocabularyEntry";

export default defineComponent({
  props: {
    wordsPerRound: {
      type: Number,
      default: 3,
    },
    optionsPerWord: {
      type: Number,
      default: 6,
    },
    stepTimeLimit: {
      type: Number,
      default: 6.6,
    },
  },
  data() {
    return {
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
      return this.round.wordIndices[this.round.currentStep];
    },
    currentWord(): VocabularyEntry {
      return this.vocabulary[this.currentWordIndex];
    },
    remainingTimePct(): number {
      return this.step.remainingTime / this.stepTimeLimit * 100;
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
      if (option === this.currentWordIndex) {
        this.nextStep();
      } else {
        this.startRound();
      }
    },
    nextStep() {
      this.round.currentStep++;
      if (this.round.currentStep === this.wordsPerRound) {
        this.$emit('minigameSignal', {
          type: 'success',
          words: this.round.wordIndices.map((i) => this.vocabulary[i].word),
        });
        this.startRound();
      } else {
        this.initializeOptions();
      }
    },
    updateTimeLimit() {
      this.step.remainingTime -= 0.05;
      if (this.step.remainingTime <= 0) {
        this.startRound();
      }
    },
  },
  mounted() {
    UnderstandApi.loadVocabulary()
        .then((entries) => this.vocabulary = entries)
        .then(() => this.startRound());

    this.tickInterval = setInterval(() => this.updateTimeLimit(), 50);
  },
});
</script>

<style lang="scss">
.mg-understand {
  .play-area {
    display: flex;
    flex-direction: column;
    gap: 1em;
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
  .time-limit {
    height: 20px;
    position: relative;

    .bar {
      position: absolute;
      top: 0.25em;

      background: rgba(pink, 0.5);
      width: var(--remainingPct, 0);
      height: 0.5em;
    }
    .label {
      position: absolute;
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
