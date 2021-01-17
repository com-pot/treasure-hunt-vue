<template>
  <div class="understand-sign-language">

    <div class="current-word" v-if="currentWord">
      <div>{{round.currentStep}} / {{wordsPerRound}}</div>
      <div>IMG</div>
      <span>{{ currentWord.word }}</span>
    </div>

    <div class="understand-options">
      <span v-for="(option, i) in round.optionIndices" :key="i" @click="selectOption(option)">{{ vocabulary[option].word }}</span>
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
      default: 5,
    },
    optionsPerWord: {
      type: Number,
      default: 6,
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
    },
    selectOption(option: number) {
      if (option === this.currentWordIndex) {
        this.round.currentStep++;
        if (this.round.currentStep === this.wordsPerRound) {
          alert("You did done good");
        } else {
          this.initializeOptions();
        }
      } else {
        this.startRound();
      }
    },
  },
  mounted() {
    UnderstandApi.loadVocabulary()
        .then((entries) => this.vocabulary = entries)
        .then(() => this.startRound());
  },
});
</script>

<style lang="scss">
.understand-sign-language {
  max-width: 420px;

  display: flex;
  flex-direction: row;
  gap: 1em;

  .current-word {
    height: 120px;
    width: 72px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .understand-options {
    border-left: 1px gray solid;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.1em;

    justify-content: space-evenly;
    align-items: center;

    > span {
      padding: 0.50em 1.25em;
      background: rgba(80, 80, 80, 0.5);
      border-radius: 2px;

      cursor: pointer;
    }
  }
}
</style>
