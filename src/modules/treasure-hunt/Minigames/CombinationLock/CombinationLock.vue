<template>
  <div class="mg-combination-lock">
    <div class="digits">
      <div class="digit" v-for="(options, i) in digitOptions" :key="i">
        <i v-for="option in options" :key="option">{{ option }}</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"

import {
  CombinationLockMinigameData,
  LockDigitOptionsSpec,
} from "./CombinationLockModel"

const createOptionsFromRange = (from: string, to: string) => {
  const options = []
  for (let i = from.charCodeAt(0); i < to.charCodeAt(0); i++) {
    options.push(String.fromCharCode(i))
  }
  return options
}
const createOptions = (spec: LockDigitOptionsSpec) => {
  if (spec === 'alpha') {
    return createOptionsFromRange('A', 'Z')
  }
  if (spec === 'num') {
    return createOptionsFromRange('0', '9')
  }
  if (!Array.isArray(spec) || !spec) {
    throw new Error("Invalid spec given")
  }

  return (spec as any[])
      .filter((item) => (item !== undefined && item !== null))
      .map((item) => '' + item)
}

export default defineComponent({
  props: {
    challengeConfig: {type: Object as PropType<CombinationLockMinigameData>, required: true},
  },
  setup(props) {
    const digitOptions = computed(() => props.challengeConfig.digits.map((digit) => createOptions(digit.options)))

    return {
      digitOptions,
    }
  },
})
</script>

<style lang="scss">
.mg-combination-lock {
  --digit-size: 2rem;
  .digits {
    display: grid;
    grid-auto-flow: column;
    gap: 0.5rem;
    place-content: start center;

    height: 10rem;
    overflow: hidden;

  }
  .digit {
    display: grid;
    grid-auto-flow: row;
    gap: 0.1rem;

    i {
      display: grid;

      place-content: center;

      width: var(--digit-size);
      height: var(--digit-size);

      background: #{'rgba(42 42 42 / 0.6)'};
    }

  }
}
</style>
