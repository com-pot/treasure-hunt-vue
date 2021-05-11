<template>
  <div class="mg-anagram">
    <div class="letters input">
      <i v-for="(letter, i) in inputLetters" :key="i"
         :class="[letter.picked && 'picked', letter.char === ' ' && 'disabled']" @click="pickLetter(i)">{{ letter.char }}</i>
    </div>
    <button :class="['btn', spaceAvailable ? 'btn-vivid' : 'btn-bland']" @click="addSpace">Mezera</button>
    <div :class="['letters', 'output']">
      <i v-for="(letter, i) in outputTextPadded" :key="i"
         @click="clearLetter(i)" :class="i >= outputText.length && 'disabled'"
      >{{ letter }}</i>
    </div>

    <MinigameControls :check-solution="checkSolution" :reset="minigameState.reset"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"


import * as Model from "./AnagramModel";
import {AnagramMinigameData, AnagramMinigameState} from "./AnagramModel";
import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState";
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue";
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils";


export default defineComponent({
  components: {MinigameControls},
  setup() {
    const minigameData = useViewData<AnagramMinigameData>()
    const minigameState = useViewState<AnagramMinigameState>(() => ({
      outputLetters: [],
    }))
    const controls = useMinigameControls()

    const inputLetters = computed<Model.InputLetter[]>(() => {

      return minigameData.value.inputText.split('')
          .map((char, i) => ({
            char,
            picked: minigameState.value.outputLetters.some((letter) => Model.isLetterSelection(letter) && letter.sourceIndex === i)
          }));
    });

    const getOutputChar = (letter: Model.OutputLetter): string => {
      if (Model.isFreeLetter(letter)) {
        return letter.char;
      }
      if (Model.isLetterSelection(letter)) {
        return inputLetters.value[letter.sourceIndex].char
      }
      console.warn("Invalid output letter", letter);
      return ''
    }

    const outputText = computed(() => minigameState.value.outputLetters.map(getOutputChar).join(''));
    const outputTextPadded = computed(() => {
      const padLength = minigameData.value.outputLength - outputText.value.length
      return outputText.value + ' '.repeat(padLength > 0 ? padLength : 0)
    })

    const spaceAvailable = computed(() => outputText.value.length && outputText.value.charAt(outputText.value.length - 1) !== ' ');

    return {
      inputLetters,
      minigameState,
      spaceAvailable,
      outputText,
      outputTextPadded,

      pickLetter(i: number) {
        let letter = inputLetters.value[i];
        if (!letter) {
          console.warn("Letter index out of bounds", i);
          return;
        }
        if (letter.picked || letter.char === ' ') {
          return;
        }
        letter.picked = true;
        minigameState.value.outputLetters.push({char: letter.char, sourceIndex: i})
      },
      addSpace() {
        if (!spaceAvailable.value) {
          return;
        }

        minigameState.value.outputLetters.push({char: ' '});
      },
      clearLetter(i: number) {
        let letter = minigameState.value.outputLetters[i];
        if (!letter) {
          return;
        }
        if (Model.isLetterSelection(letter)) {
          inputLetters.value[letter.sourceIndex].picked = false;
        }
        minigameState.value.outputLetters.splice(i, 1);
      },

      checkSolution() {
        controls.checkSolution(controls.serializeSolution(outputText.value))
      },
    };
  },
});

</script>

<style lang="scss">
@import "~@/sass/vars/colors";

.mg-anagram {
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  .letters {
    display: flex;
    flex-direction: row;
    gap: 0.1em;

    justify-content: center;

    i {
      display: inline-block;
      width: 32px;
      height: 24px;
      font-style: normal;

      background: $dim;
      border: 2px solid;

      &:not(.picked):not(.disabled) {
        cursor: pointer;
        border-color: deeppink;
        color: deeppink;
      }

      &.picked, &.disabled {
        filter: opacity(0.75);
        border-color: #ccc;
        color: #ccc;
      }
    }
  }

  .output.success {
    i {
      color: lightgreen !important;
      border-color: lightgreen !important;
    }
  }
}
</style>
