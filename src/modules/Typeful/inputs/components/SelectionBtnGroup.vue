<template>
  <div class="btn-group -selection" :data-size="size">
    <template v-for="(option, i) in options" :key="i">
      <button class="btn" :class="sc.isActive(option) && activeClass"
              @click.prevent="sc.toggleActive(option)"
              :disabled="disabled || sc.optionIsDisabled(option)"
      >{{ option.label }}</button>
    </template>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import selectionUtils from "@src/modules/Typeful/inputs/utils/selectionUtils"

export default defineComponent({
  props: {
    disabled: {type: Boolean},

    ...selectionUtils.props,

    size: {type: String},
    activeClass: {type: String, default: '-acc-primary'},
  },
  setup(props, {emit}) {
    const sc = selectionUtils.createSelectionController(props, (value) => emit('update:modelValue', value))

    return {
      sc,
    }
  },
})
</script>
