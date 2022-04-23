<template>
  <div class="condition">
    <TypefulInputPair :label="label" name="conditionType"
                      type="select" :options="conditionTypes"
                      :in-opts="{label: 'name', valueProp: 'name'}"
                      placeholder="Vždy"
                      v-model="typeStr"

                      class="inline"

    />

    <template v-if="selectedType?.arguments">
      <hr>

      <TypefulAutoSection
          :inputs="selectedType.arguments"
          v-model="modelValue.arguments"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"
import {Condition} from "@src/modules/TypefulExecutive/model/Condition"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import {ConditionType} from "@src/modules/TypefulExecutive/model/ConditionType"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"

export default defineComponent({
  components: {TypefulAutoSection, TypefulInputPair},
  props: {
    modelValue: {type: Object as PropType<Condition>},
    conditionTypes: {type: Array as PropType<ConditionType[]>, required: true},
    label: {type: String, default: ''},
  },
  setup(props, {emit}) {
    const typeStr = computed({
      get: () => props.modelValue?.type ?? null,
      set: (value: string | null) => {
        if (!value) {
          emit('update:model-value', null)
          return
        }
        // We could maybe try pass some of the parameters over from current arguments to new arguments
        emit('update:model-value', {type: value, arguments: {}})
      },
    })

    const selectedType = computed<ConditionType|null>(() => {
      return typeStr.value && props.conditionTypes.find((type) => type.name === typeStr.value)
    })

    return {
      typeStr,
      selectedType,
    }
  },
})
</script>
