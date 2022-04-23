<template>
  <div class="loading-indicator" :data-size="size" :data-layout="layout"
       :style="`--speed: ${speed}ms; --c-offset: ${cOffset}ms; --peg-count: ${pegs};`">
    <i class="peg" v-for="i in pegs" :key="i" :style="`--o: ${i};`"/>
    <span class="label" v-if="label">{{ label }}</span>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"

export default defineComponent({
  props: {
    speed: {type: Number, default: 1250},
    cOffset: {type: Number, default: 160},
    pegs: {type: Number, default: 3},

    label: {type: String},

    size: {type: String},
    layout: {type: String},
  },
})
</script>

<style lang="scss">
.loading-indicator {
  --base-size: 1rem;
  --intermediate-size: calc(var(--base-size) * 4);
  --max-size: calc(var(--base-size) * 5);

  display: grid;
  grid-template-rows: var(--max-size);

  place-content: center;
  place-items: center;
  gap: calc(var(--base-size) * 0.5);

  &[data-size="full"] {
    width: 100vw;
    height: 100vh;
  }
  &[data-size="fill"] {
    height: 100%;
    width: 100%;
  }


  &:not([data-layout]) {
    grid-template-columns: auto repeat(var(--peg-count), auto) auto;

    .label {
      grid-column: 1 / -1;
    }
    .peg {
      grid-column: calc(var(--o) + 1);
    }
  }
  &[data-layout="inline"] {
    --base-size: 0.5rem;
    grid-template-columns: repeat(var(--peg-count), auto) auto;

    .label {
      margin-inline-start: 0.5rem;
    }
  }

  .peg {
    width: var(--base-size);
    height: var(--base-size);
    background: var(--primary-500);
    border-radius: var(--base-size);

    animation: bootstrap-pulse var(--speed) cubic-bezier(0.5, 0.3, 0.5, 0.9) infinite;
    animation-delay: calc(var(--o) * var(--c-offset));
  }
}

@keyframes bootstrap-pulse {
  50% {
    height: var(--intermediate-size);
  }

  30%, 70% {
    height: var(--max-size);
  }
}

</style>
