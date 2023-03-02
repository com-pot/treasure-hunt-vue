<template>
  <div class="timeout" :class="timeout.status">
    <div class="progressbar">
      <div class="chunk -acc-vivid" :style="'--done:' + timeout.pctElapsed + ';'"></div>
      <div class="chunk -acc-vile" :style="`--done:${(1 - (timeout.pctElapsed || 0))};`"></div>
    </div>
    <span class="time-left" v-if="$slots.timeLeft"><slot name="timeLeft"/></span>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from "vue"
import {PlayerTimeout} from "./playerTimeout"

export default defineComponent({
  props: {
    timeout: {type: Object as PropType<PlayerTimeout>, required: true},
    showTime: {type: Boolean},
  },
})

</script>

<style lang="scss">
.timeout {
  transition: opacity 0.3s ease;

  &:not(.ticking) {
    opacity: 0;
  }
}
</style>
