<template>
  <div class="code-example" :class="expanded && 'expanded'">
    <div class="header" @click="expanded = !expanded">
      <slot name="header"><span>{{ header }}</span></slot>
      <span class="toggle">&gt;</span>
    </div>

    <pre class="code"><slot></slot></pre>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"

export default defineComponent({
  props: {
    header: {type: String},
  },
  data: () => ({
    expanded: false,
  })
})
</script>
