<template>
  <SelectScroller v-if="mode === 'scroller'"  :options="options"
                  :model-value="modelValue" @update:model-value="$emit('update:model-value', $event)"
                  :class="$props.class" class="combo-pick-input"
  />
  <TypefulInput type="select" :options="options"
                :model-value="modelValue" @update:model-value="$emit('update:model-value', $event)"

                :can-clear="false"
                :placeholder="placeholder"
                :class="$props.class"
  />
</template>

<script lang="ts">

import {defineComponent, onMounted, onUnmounted, PropType, ref, watch} from "vue"
import SelectScroller from "./SelectScroller.vue";
import TypefulInput from "@/modules/Typeful/components/TypefulInput";

export default defineComponent({
  inheritAttrs: false,
  components: {TypefulInput, SelectScroller},
  props: {
    mode: {type: String, default: 'scroller'},
    options: {type: Array as PropType<string[]>, required: true},
    modelValue: {type: String},
    placeholder: {type: String},
    class: {},
  },
})
</script>
