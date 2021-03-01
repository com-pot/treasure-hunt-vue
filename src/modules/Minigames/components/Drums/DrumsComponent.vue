<template>
  <p v-if="!loaded">Zde budou bubny</p>

  <div class="mg-drums" v-else>

    <div class="guide" v-if="currentPattern">
      <span>Měl bych opakovat, co slyším...</span>
      <button @click="playSamplePattern()" :disabled="isPlaying" class="btn btn-vivid">Poslechnout</button>
      <div class="progression">
        <span v-for="(step, i) in currentPattern" :key="i" :class="['step', i < currentAttemptStep && 'check']">{{drums[step].note}}</span>
      </div>
    </div>

    <div class="guide" v-else>
      All done!
    </div>

    <div class="drums" v-if="loaded">
      <button v-for="drum in drums" :key="drum.note" class="btn btn-vivid drum" @click.prevent="hitDrum(drum)">{{ drum.note }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import * as Tone from "tone";
import {computed, defineComponent, ref} from "vue";

type Drum = {
  note: string,
};

export default defineComponent({
  setup(props, {emit}) {
    const drums = ref([
      {note: 'C4'},
      {note: 'G4'},
      {note: 'C5'},
      {note: 'G5'},
    ] as Drum[]);

    const patterns = ref([
      [0, 2, 0],
      [0, 2, 0, 3, 2],
    ]);

    const loaded = ref(false);
    let synth = new Tone.Sampler({
      urls: {
        "E4": "Bass-Drum-Hit-Level-5a-www.fesliyanstudios.com.mp3",
      },
      release: 1,
      baseUrl: "/audio/drums/",
      onload: () => loaded.value = true,
    });

    let drumAdjuster = new Tone.Volume(0).toDestination();
    synth.connect(drumAdjuster)

    let correctPatterns = ref(0);
    let currentPattern = computed(() => patterns.value[correctPatterns.value]);
    let currentAttemptStep = ref(0);

    function hitDrum(drum: Drum, source: 'player'|'sample' = 'player', when?: number) {
      drumAdjuster.set({
        volume: (Math.random() - 0.5) * 6,
      });
      synth.triggerAttackRelease(drum.note, "8n", when);

      if (source !== "player") {
        return;
      }

      let pattern = currentPattern.value;
      if (!pattern) {
        return
      }

      let nextNoteIndex = pattern[currentAttemptStep.value];
      let nextNote = drums.value[nextNoteIndex].note;

      if (nextNote && drum.note === nextNote) {
        currentAttemptStep.value++;
        if (currentAttemptStep.value === currentPattern.value.length) {
          correctPatterns.value++;
          currentAttemptStep.value = 0;
        }
        if (correctPatterns.value === patterns.value.length) {
          emit('minigameSignal', {
            type: 'success',
          });
        }
      } else {
        currentAttemptStep.value = 0;
      }
    }

    let isPlaying = ref(false);

    async function playSamplePattern() {
      let now = Tone.now();

      isPlaying.value = true;
      currentPattern.value.forEach((drumIndex, i) => {
        hitDrum(drums.value[drumIndex], 'sample', now + i * 0.66);
      });

      isPlaying.value = false;
    }

    return {
      drums,
      hitDrum,
      playSamplePattern,
      loaded,
      currentPattern,
      currentAttemptStep,
      isPlaying,
    };
  },
});
</script>

<style lang="scss">
.mg-drums {

  .guide {
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.25em;
  }

  .step {
    display: inline-block;
    padding: 2px 4px;
    border: 1px solid lightgray;
    border-radius: 4px;

    &.check {
      text-decoration: underline;
    }
  }

  .drums {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1em;

    .drum {
      width: 72px;
      height: 80px;

      font-weight: bold;
      font-size: 16pt;

      @for $n from 1 through 4 {
        &:nth-child(#{$n}) {
          margin-top: 10px - $n * 5px;
        }
      }
    }
  }
}
</style>
