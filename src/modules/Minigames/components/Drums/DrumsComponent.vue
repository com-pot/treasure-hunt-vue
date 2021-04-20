<template>
  <p v-if="!loaded">Zde budou bubny</p>

  <div v-else class="mg-drums" :style="'--strike-duration: ' + strikeAnimationDuration + 'ms'">

    <div class="guide" v-if="currentPattern">
      <span>Měl bych opakovat, co slyším...</span>
      <button @click="playSamplePattern()" :disabled="isPlaying" class="btn btn-vivid">Poslechnout</button>
    </div>

    <div class="guide" v-else>
      All done!
    </div>

    <div class="drums" v-if="loaded">
      <button v-for="(drum, i) in drums" :key="drum.note"
              :class="['drum', strikes[i] && 'strike']"
              @click.prevent="hitDrum(i)"
      />
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
    ] as Drum[])
    const strikes = ref(drums.value.map(() => false))
    const strikeAnimationDuration = 100

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

    const animateStrike = (i: number) => {
      strikes.value[i] = true
      setTimeout(() => strikes.value[i] = false, strikeAnimationDuration)
    }

    function hitDrum(i: number, source: 'player'|'sample' = 'player', when?: number) {
      const drum = drums.value[i]

      drumAdjuster.set({
        volume: (Math.random() - 0.5) * 6,
      });
      synth.triggerAttackRelease(drum.note, "8n", when);
      if (!when) {
        animateStrike(i)
      } else {
        const timeout = synth.toSeconds(when) - synth.now()
        setTimeout(() => animateStrike(i), timeout * 1000)
      }

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
        hitDrum(drumIndex, 'sample', now + i * 0.66);
      });

      isPlaying.value = false;
    }

    return {
      drums,
      strikes,
      hitDrum,
      playSamplePattern,
      loaded,
      currentPattern,
      currentAttemptStep,
      isPlaying,
      strikeAnimationDuration,
    };
  },
});
</script>

<style lang="scss">
$drumAppearance: 1.07, 1.01, 0.94, 1;

.mg-drums {

  .guide {
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.25em;
  }

  .drums {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-right: -0.5em;

    .drum {
      margin-right: 0.5em;
      width: 120px;
      height: 110px;

      border: none;
      background: url("./resources/drum.png") center;
      background-size: contain;

      @for $i from 1 through length($drumAppearance) {
        $brightness: nth($drumAppearance, $i);

        &:nth-child(#{$i}) {
          filter: brightness($brightness);
        }
      }

      &.strike {
        animation: drum-strike var(--strike-duration);

        transition: all var(--strike-duration);
      }
    }
  }
}

@keyframes drum-strike {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.05);
  }
}
</style>
