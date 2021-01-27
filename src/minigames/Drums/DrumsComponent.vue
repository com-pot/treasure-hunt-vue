<template>
  <p v-if="!loaded">Zde budou bubny</p>

  <div class="mg-drums" v-else>

    <div class="guide" v-if="currentPattern">
      <span>Měl bych opakovat, co slyším...</span>
      <button @click="playSamplePattern()" :disabled="isPlaying">Poslechnout</button>
      <div class="progression">
        <span v-for="(step, i) in currentPattern" :key="i" :class="['step', i < currentAttemptStep && 'check']">{{step}}</span>
      </div>
    </div>

    <div class="guide" v-else>
      All done!
    </div>

    <div class="drums" v-if="loaded">
      <button v-for="drum in drums" :key="drum.note" class="drum" @click="hitDrum(drum)">{{ drum.note }}</button>
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
  setup() {
    const drums = ref([
      {note: 'C4'},
      {note: 'D4'},
      {note: 'E4'},
      {note: 'F4'},
    ] as Drum[]);

    const patterns = ref([
      ['C4', 'E4', 'C4'],
      ['C4', 'E4', 'C4', 'F4', 'E4'],
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

    function hitDrum(drum: Drum) {
      drumAdjuster.set({
        volume: (Math.random() - 0.5) * 6,
      });
      console.log(drumAdjuster.volume.value)

      synth.triggerAttackRelease(drum.note, "8n");
      let pattern = currentPattern.value;
      if (!pattern) {
        return
      }
      let nextNote = pattern[currentAttemptStep.value];

      if (nextNote && drum.note === nextNote) {
        currentAttemptStep.value++;
        if (currentAttemptStep.value === currentPattern.value.length) {
          correctPatterns.value++;
          currentAttemptStep.value = 0;
        }
      } else {
        currentAttemptStep.value = 0;
      }
    }

    let isPlaying = ref(false);

    async function playSamplePattern() {
      let now = Tone.now();

      isPlaying.value = true;
      currentPattern.value.forEach((note, i) => {
        synth.triggerAttackRelease(note, '8n', now + i * 0.66);
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
    gap: 0.5em;

    .drum {
      width: 60px;
      height: 80px;
      border: none;
      background: #444;
      border-radius: 8px;

      color: deeppink;
      font-weight: bold;
      font-size: 16pt;
    }
  }
}
</style>
