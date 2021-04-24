<template>
  <div class="mg-ctrl">
    <button v-if="reset" class="btn btn-bland" @click="reset">Začít znovu</button>
    <button :class="['btn', success ? 'btn-success' :'btn-vivid']"
            @click="trySolution" :disabled="evaluating"
    >Vyzkoušet řešení</button>
  </div>
</template>

<script lang="ts">

import {defineComponent, ref} from "vue"

export default defineComponent({
  props: {
    reset: Function,
    checkSolution: Function,
    success: Boolean,
  },
  setup(props) {
    const evaluating = ref(false)

    const trySolution = () => {
      const result = props.checkSolution?.()
      if (result instanceof Promise) {
        evaluating.value = true
        result.finally(() => evaluating.value = false)
      }
    }

    return {
      evaluating,
      trySolution,
    }
  },
})

</script>

<style lang="scss">
.mg-ctrl {
  margin-top: 2em;
  display: flex;
  justify-content: space-evenly;
}
</style>
