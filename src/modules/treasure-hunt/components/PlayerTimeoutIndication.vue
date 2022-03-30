<template>
  <div class="timeout" :class="timeout.status">
    <div class="progressbar">
      <div class="chunk -vivid" :style="'--done:' + timeout.pctElapsed + ';'"></div>
      <div class="chunk -vile" :style="`--done:${(1 - (timeout.pctElapsed || 0))} + ';`"></div>
    </div>
    <span v-if="displayType" class="time-left">{{ timeout.timeLeftText }}</span>

  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from "vue"
import {PlayerTimeout} from "./playerTimeout"

export default defineComponent({
  props: {
    timeout: {type: Object as PropType<PlayerTimeout>, required: true},
    displayType: {type: Boolean},
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
