<template>
  <div class="mg-container">
    <router-view class="mg-element" @minigameSignal="handleSignal" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  setup() {
    return {
      handleSignal(signal: any) {
        if ('type' in signal && signal.type === 'success') {
          alert("Gooooooood");
        }
      }
    }
  },
})
</script>
