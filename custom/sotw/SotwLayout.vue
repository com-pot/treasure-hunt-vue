<template>
  <div class="root-container" :class="layoutSkin">
    <router-view />
  </div>

  <div class="bg">
    <div class="texture"></div>
    <div class="cloud cloud-top-left"></div>
    <div class="cloud cloud-top-right"></div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from "vue"
import {useRoute} from "vue-router"

import useLayoutSkin from "@src/modules/Layout/mixins/useLayoutSkin"

export default defineComponent({
  setup() {
    const layoutSkin = useLayoutSkin(useRoute())

    return {
      layoutSkin,
    }
  },
})
</script>
