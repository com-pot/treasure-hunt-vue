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
@import "../../../sass/vars/colors";
.timeout {

  transition: opacity 0.3s ease;
  &:not(.ticking) {
    opacity: 0;
  }

  .progressbar {
    border-radius: 0.25rem;
    overflow: hidden;
    line-height: 0;

    box-shadow: 1px 1px 0 0 $dim;
    background: rgba($dim, 0.1);

    .chunk {
      display: inline-block;
      height: 0.5rem;

      width: calc(var(--done) * 100%);

      &.-vivid {
        background: $vivid;
      }
      &.-vile {
        background: $vile;
      }
    }
  }
}
</style>
