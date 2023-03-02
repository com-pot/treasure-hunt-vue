<template>
  <input type="number" v-model="iv">
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"

export default defineComponent({
  props: {
    modelValue: {type: Number},
  },
  setup(props, {emit}) {
    const iv = computed({
      get() {
        return props.modelValue
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
