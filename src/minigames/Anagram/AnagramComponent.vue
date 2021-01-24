<template>
  <div class="mg-anagram">
    <div class="title">Shuffle pls</div>
    <div class="letters input">
      <i v-for="(letter, i) in inputLetters" :key="i"
         :class="letter.picked && 'picked'" @click="pickLetter(i)">{{ letter.char }}</i>
    </div>
    <div :class="['letters', 'output', outputSuccess && 'success']">
      <i v-for="(letter, i) in outputLetters" @click="clearLetter(i)" :key="i">{{ letter.char }}</i>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from "vue";

type InputLetter = { char: string, picked: boolean };
type OutputLetter = {char: string, sourceIndex: number};

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

    return {
      inputLetters,
      outputLetters,
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
      clearLetter(i: number) {
        let letter = outputLetters.value[i];
        if (!letter) {
          return;
        }
        if (letter.sourceIndex) {
          inputLetters.value[letter.sourceIndex].picked = false;
        }
        outputLetters.value.splice(i, 1);
      }
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
      display: inline-block;
      width: 32px;
      height: 24px;
      font-style: normal;

      background: #aaa;

      &:not(.picked) {
        cursor: pointer;
      }
      &.picked {
        filter: opacity(0.75);
      }
    }
  }

  .output.success {
    i {
      background: lightgreen;
    }
  }
}
</style>
