<template>
  <div class="mg-choice" :data-appearance="appearanceKey">
    <div class="options" v-if="appearanceKey === 'picture'">
      <div v-for="(option, i) in normalizedOptions" :key="option.value"
           class="option" :class="state.value.selection === option.value && 'active'"
           @click="state.value.selection = option.value"
           :style="'--order: ' + (i * 7 % 11) + ';'"
      >
        <img :src="'/minigames/shamans/' + option + '.png'" :alt="option.label"/>
      </div>
    </div>

    <template v-else-if="appearanceKey === 'button'">
      <TypefulInputPair name="choice" type="select" mode="btn-group"
                        :options="normalizedOptions"
                        :model-value="state.value.selection"
                        @update:model-value="$emit('check-solution', $event)"
      />
    </template>

    <p v-else>Vzhled volby není podporován</p>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, watch, PropType} from "vue";
import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"

type ValueLabelOption = {value: string, label: string}

type PictureAppearance = {
  key: 'picture',
  pathTemplate: string,
}
type ButtonAppearance = {
  key: 'button',
}
type ChoiceMinigameData = {
  options: string[] | ValueLabelOption[],
  appearance?: PictureAppearance | ButtonAppearance,
}
type ChoiceMinigameState = {
  selection: string|null,
}

export default defineComponent({
  components: {TypefulInputPair},
  props: {
    challengeConfig: {type: Object as PropType<ChoiceMinigameData>, required: true},
  },
  setup(props, {emit}) {
    const state = useViewState<ChoiceMinigameState>(() => {
      return {selection: null}
    })

    const normalizedOptions = computed<ValueLabelOption[]>(() => (props.challengeConfig?.options || []).map((option) => {
      if (typeof option === 'string') {
        return {value: option, label: option}
      }
      return option
    }))

    const appearanceKey = computed(() => props.challengeConfig.appearance?.key || 'picture')

    watch(appearanceKey, (key) => {
      const useConfirm = key === 'picture'

      exposeMinigameControls({
        getValue: useConfirm ? () => state.value.selection : undefined,
      }, emit)
    })


    return {
      appearanceKey,
      normalizedOptions,

      state,
    }
  },
})
</script>

<style lang="scss">
.mg-choice[data-appearance="picture"] {
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
