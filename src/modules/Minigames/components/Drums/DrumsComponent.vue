<template>
  <p v-if="!loaded">Probíhá příprava obřadu</p>

  <div v-else class="mg-drums" :style="'--strike-duration: ' + strikeAnimationDuration + 'ms'">

    <div class="guide" v-if="currentPattern">
      <span>Měl bych opakovat, co slyším...</span>
      <button @click="playSamplePattern()" :disabled="isPlaying" class="btn btn-vivid">Poslechnout</button>
    </div>

    <div class="guide" v-else>
      Hotovo
    </div>

    <div class="drums" v-if="loaded" :class="isPlaying && 'sample-playing'">
      <button v-for="(drum, i) in drums" :key="drum.note"
              :class="['drum', strikes[i] && 'strike']"
              @click.prevent="hitDrum(i, $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import * as Tone from "tone";
import {computed, defineComponent, onBeforeUnmount, onMounted, ref} from "vue";
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"
import {resolveAfter} from "@/utils/promiseUtils"

type Drum = {
  note: string,
};

export default defineComponent({
  setup() {
    const controls = useMinigameControls()

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
      [0, 2, 0, 3, 2, 3, 3, 0, 1],
    ]);

    const loaded = ref(false);
    let synth = new Tone.Sampler({
      urls: {
        "G4": "tabla2.mp3",
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

    const getVolume = (event?: MouseEvent) => {
      const hitHeight = event && event.offsetY
      if (event && typeof hitHeight === "number") {
        const target = event.target as HTMLButtonElement
        const heightPct = (target.clientHeight - hitHeight) / target.clientHeight
        return (heightPct - 0.5) * 6
      }

      return (Math.random() - 0.5) * 6
    }

    function hitDrum(i: number, event: MouseEvent) {
      const drum = drums.value[i]
      drumAdjuster.set({volume: getVolume(event)})

      synth.triggerAttackRelease(drum.note, "8n");
      animateStrike(i)

      progressSequence(drum.note)
    }

    const sequence = {
      resetCurrentPatternAttempt() {
        currentAttemptStep.value = 0;
      },
      progressAttempt() {
        correctPatterns.value++;
        currentAttemptStep.value = 0;
        playSamplePattern(750)
      },
    }

    function progressSequence(note: string) {
      let pattern = currentPattern.value;
      if (!pattern) {
        return
      }

      let nextNoteIndex = pattern[currentAttemptStep.value];
      let nextNote = drums.value[nextNoteIndex].note;

      if (!nextNote || note !== nextNote) {
        sequence.resetCurrentPatternAttempt()
        playSamplePattern(500)
        return
      }

      currentAttemptStep.value++;
      if (currentAttemptStep.value === currentPattern.value.length) {
        sequence.progressAttempt()
      }

      if (correctPatterns.value === patterns.value.length) {
        controls.checkSolution(controls.serializeSolution('' + (69713 + correctPatterns.value * 48213 )))
      }
    }

    let isPlaying = ref(true);

    async function playSamplePattern(after?: number) {
      if (!currentPattern.value) {
        return
      }

      isPlaying.value = true;
      if (after) {
        await resolveAfter(after)
      }

      const notes = currentPattern.value.map((drumIndex) => drums.value[drumIndex].note)
      let i = 0

      await new Promise((res) => {
        const sequence = new Tone.Sequence(function (time, note) {
          animateStrike(currentPattern.value[i])
          synth.triggerAttackRelease(note, "8n")
          i++
          if (i === sequence.length) {
            sequence.stop()
            res()
          }
        }, notes)
        sequence.start()
      })

      isPlaying.value = false;
    }

    onMounted(() => {
      Tone.Transport.set({bpm: 90})
      Tone.Transport.start()
      playSamplePattern(750)
    })

    onBeforeUnmount(() => {
      Tone.Transport.stop()
    })

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

    transition: opacity 0.1s;
    &.sample-playing {
      pointer-events: none;

      opacity: 0.75;
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
