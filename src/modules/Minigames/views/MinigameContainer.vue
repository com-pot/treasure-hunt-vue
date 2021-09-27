<template>
  <div class="mg-container">
    <router-view class="mg-element" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  setup() {
    return {
      handleSignal(signal: any) {
        if (!('type' in signal)) {
          console.warn("No type");
          return
        }

        if (signal.type === 'success') {
          alert("Gooooooood");
        } else if (signal.type === 'error') {
          alert("Ooooof");
        }
      }
    }
  },
})
</script>
