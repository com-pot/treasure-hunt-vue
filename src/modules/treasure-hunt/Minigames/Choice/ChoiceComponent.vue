<template>
  <div class="mg-choice">
    <div class="options">
      <div v-for="(option, i) in data.options" :key="option"
           class="option" :class="state.value.selection === option && 'active'"
           @click="state.value.selection = option"
           :style="'--order: ' + (i * 7 % 11) + ';'"
      >
        <img :src="'/minigames/shamans/' + option + '.png'" :alt="option"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMinigameData, useViewState} from "@/modules/treasure-hunt/components/minigameData"
import {useMinigameControls} from "@/modules/treasure-hunt/components/minigameData"

type ChoiceMinigameData = {
  options: string[],
}
type ChoiceMinigameState = {
  selection: string|null,
}

export default defineComponent({
  setup() {
    const data = useMinigameData<ChoiceMinigameData>()
    const state = useViewState<ChoiceMinigameState>(() => {
      return {selection: null}
    })

    useMinigameControls<string|null>({
      getValue: () => state.value.selection,
    })

    return {
      data,
      state,
    }
  },
})
</script>

<style lang="scss">
.mg-choice {

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .option {
    display: grid;
    place-items: center;

    img {
      width: auto;
      height: 6em;

      animation: active-shadow 2s infinite ease-in-out;
      animation-delay: calc(var(--order) * -120ms);
    }

    --shadow-blur-min: 2px;
    --shadow-blur-max: 6px;
    --shadow-color: indigo;

    &, & img {
      transition: all 1s ease;
    }

    &.active {
      --shadow-blur-min: 10px;
      --shadow-blur-max: 16px;
      --shadow-color: darkblue;
    }

    &:not(.active) {

      filter: saturate(0.2);
    }
  }
}

@keyframes active-shadow {
  0%, 100% {
    filter: drop-shadow(0 0 var(--shadow-blur-min) var(--shadow-color));
  }
  50% {
    filter: drop-shadow(0 0 var(--shadow-blur-max) var(--shadow-color));
  }
}
</style>
