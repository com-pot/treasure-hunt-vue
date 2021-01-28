<template>
  <div class="mg-anagram">
    <div class="title">Shuffle pls</div>
    <div class="letters input">
      <i v-for="(letter, i) in inputLetters" :key="i"
         :class="[letter.picked && 'picked', letter.char === ' ' && 'disabled']" @click="pickLetter(i)">{{ letter.char }}</i>
    </div>
    <button :class="['btn', spaceAvailable ? 'btn-vivid' : 'btn-bland']" @click="addSpace">Mezera</button>
    <div :class="['letters', 'output', outputSuccess && 'success']">
      <i v-for="(letter, i) in outputLetters" @click="clearLetter(i)" :key="i">{{ letter.char }}</i>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from "vue";

type InputLetter = { char: string, picked: boolean };
type OutputLetter = {char: string, sourceIndex?: number};

export default defineComponent({
  props: {
    inputText: {type: String, default: "nag a ram"},
  },

  setup(props) {
    let inputLetters = ref(props.inputText.split('').map((char) => ({
      char, picked: false,
    })) as InputLetter[]);
    let outputLetters = ref([] as OutputLetter[]);
    let outputText = computed(() => outputLetters.value.map((l) => l.char).join(''));
    let outputSuccess = computed(() => outputText.value === "anagram");

    const spaceAvailable = computed(() => outputText.value.length && outputText.value.charAt(outputText.value.length - 1) !== ' ');

    return {
      inputLetters,
      outputLetters,
      spaceAvailable,
      outputSuccess,
      pickLetter(i: number) {
        let letter = inputLetters.value[i];
        if (!letter) {
          console.warn("Letter index out of bounds", i);
          return;
        }
        if (letter.picked) {
          return;
        }
        letter.picked = true;
        outputLetters.value.push({char: letter.char, sourceIndex: i})
      },
      addSpace() {
        if (!spaceAvailable.value) {
          return;
        }

        outputLetters.value.push({char: ' '});
      },
      clearLetter(i: number) {
        let letter = outputLetters.value[i];
        if (!letter) {
          return;
        }
        if (typeof letter.sourceIndex === "number") {
          inputLetters.value[letter.sourceIndex].picked = false;
        }
        outputLetters.value.splice(i, 1);
      }
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
