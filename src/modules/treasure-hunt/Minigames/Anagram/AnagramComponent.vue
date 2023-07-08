<template>
  <div class="mg-anagram">
    <div class="letters input">
      <i v-for="(letter, i) in inputLetters" :key="i"
         :class="[letter.picked && 'picked', letter.char === ' ' && 'disabled']" @click="pickLetter(i)">{{ letter.char }}</i>
    </div>
    <button :class="['btn']" :disabled="!spaceAvailable" @click="addSpace">Mezera</button>
    <div :class="['letters', 'output']">
      <i v-for="(letter, i) in outputTextPadded" :key="i"
         @click="clearLetter(i)" :class="i >= outputText.length && 'disabled'"
         :style="'--order: ' + i + ';'"
      >{{ letter }}</i>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"


import * as Model from "./AnagramModel";
import {AnagramMinigameData, AnagramMinigameState} from "./AnagramModel";
import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"

export default defineComponent({
  props: {
    challengeConfig: {type: Object as PropType<AnagramMinigameData>, required: true},
  },
  setup(props, {emit}) {
    const minigameState = useViewState<AnagramMinigameState>(() => ({
      outputLetters: [],
    }))
    exposeMinigameControls({
      reset: () => minigameState.reset(props.challengeConfig),
      getValue: () =>  outputText.value,
    }, emit)

    const inputLetters = computed<Model.InputLetter[]>(() => {

      return props.challengeConfig.inputText.split('')
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
      const padLength = props.challengeConfig.outputLength - outputText.value.length
      return (outputText.value + ' '.repeat(padLength > 0 ? padLength : 0)).split('')
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
    };
  },
});

</script>

<style lang="scss">

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
      display: inline-grid;
      width: 2em;
      height: 2em;
      font-style: normal;
      place-content: center;

      background: var(--neutral-900);
      border: 2px solid;

      &:not(.picked):not(.disabled) {
        cursor: pointer;
        border-color: var(--hsl-primary);
        color: var(--hsl-primary);
      }

      &.picked, &.disabled {
        filter: opacity(0.75);
        border-color: var(--neutral-600);
        color: var(--neutral-600);
      }
    }
  }

  .output {
    i {
      &:not(.disabled) {
        animation: swimmy-letter 3s infinite linear;
        animation-delay: calc(100ms * var(--order));
      }
    }

    .success {
      i {
        color: lightgreen !important;
        border-color: lightgreen !important;
      }
    }
  }
}

@keyframes swimmy-letter {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-2px);
  }
  75% {
    transform: translateY(2px);
  }
}
</style>
