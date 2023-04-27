<template>
  <div class="bg">
  </div>
  <div class="root-container" :data-skin="layoutSkin">
    <router-view />
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
