<script lang="ts" setup>
import { debounce } from "@src/utils/timingUtils"
import { computed, ref, watch } from "vue"


const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: { type: Object },
  mode: { type: String },
})



const modelValueStr = computed(() => props.modelValue ? JSON.stringify(props.modelValue) : "")
const ivStr = ref("")
const ivValid = ref(true)

const tryUpdateValue = debounce(() => {
  const value = ivStr.value
  if (!value) {
    ivValid.value = true
    emit('update:modelValue', null)
    return
  }

  try {
    const obj = JSON.parse(value)
    if (typeof obj !== "object" || Array.isArray(obj)) {
      ivValid.value = false
      return
    }
    ivValid.value = true
    emit('update:modelValue', obj)
  } catch (e) {
    ivValid.value = false
  }
}, 100)

const iv = computed<string>({
  get() {
    return ivStr.value
  },
  set(value) {
    ivStr.value = value

    tryUpdateValue()
  }
})

</script>

<template>
  <textarea 
    :class="!ivValid && 'json-invalid'"
    v-model="iv"
    @blur="() => ivStr = modelValueStr"
    />
</template>

<style>
.json-invalid {
  text-decoration: line-through red solid;
}
</style>