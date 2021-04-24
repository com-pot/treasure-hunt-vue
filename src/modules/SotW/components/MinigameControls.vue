<template>
  <div class="mg-ctrl">
    <button v-if="reset" class="btn btn-vivid" @click="reset">Začít znovu</button>
    <button class="btn btn-bland" @click="checkSolution">Vyzkoušet řešení</button>
  </div>
</template>

<script lang="ts">

import {defineComponent} from "vue"

export default defineComponent({
  props: {
    reset: Function,
    checkSolution: Function,
  },

})

</script>
