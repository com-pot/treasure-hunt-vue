<template>
  <div class="timeout" :class="timeout.status">
    <div class="progressbar">
      <div class="chunk -vivid" :style="'--done:' + timeout.pctElapsed + ';'"></div>
      <div class="chunk -vile" :style="'--done:' + (1 - timeout.pctElapsed) + ';'"></div>
    </div>
<!--    <span class="time-left">{{ timeout.timeLeftText }}</span>-->

  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from "vue"
import {PlayerTimeout} from "@/modules/SotW/utils/playerTimeout"

export default defineComponent({
  props: {
    timeout: {type: Object as PropType<PlayerTimeout>, required: true}
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
