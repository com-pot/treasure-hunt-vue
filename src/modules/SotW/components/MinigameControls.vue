<template>
  <div class="mg-ctrl">
    <button v-if="reset" class="btn btn-bland" @click="reset">Začít znovu</button>
    <button :class="['btn', success ? 'btn-success' :'btn-vivid']" @click="checkSolution">Vyzkoušet řešení</button>
  </div>
</template>

<script lang="ts">

import {defineComponent} from "vue"

export default defineComponent({
  props: {
    reset: Function,
    checkSolution: Function,
    success: Boolean,
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
