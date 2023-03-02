<template>
  <textarea v-if="mode === 'block'" v-model="iv"/>
  <input v-else type="text" v-model="iv">
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"

export default defineComponent({
  props: {
    modelValue: {type: String},
    mode: {type: String},
  },
  setup(props, {emit}) {
    const iv = computed<string>({
      get() {
        return props.modelValue || ''
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    return {
      iv,
    }
  },
})
</script>
