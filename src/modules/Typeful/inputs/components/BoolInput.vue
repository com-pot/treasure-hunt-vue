<template>
  <input type="checkbox" v-model="iv"/>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue"

export default defineComponent({
  props: {
    modelValue: {type: Boolean},
    mode: {type: String},
  },
  setup(props, {emit}) {
    const iv = computed<boolean>({
      get() {
        return !!props.modelValue
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
