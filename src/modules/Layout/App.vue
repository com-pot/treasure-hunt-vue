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
import {computed, defineComponent} from "vue"
import {useRoute} from "vue-router"

export default defineComponent({
  setup() {
    const route = useRoute()

    const layoutSkin = computed(() => {
      let skin = ''
      route.matched.forEach((match) => {
        if (match.meta.skin) {
          skin += (skin ? ' ' : '') + match.meta.skin
        }
      })
      return skin
    })

    return {
      layoutSkin,
    }
  },
})
</script>
