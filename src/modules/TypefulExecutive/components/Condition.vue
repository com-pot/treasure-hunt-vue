<template>
  <div class="condition">
    <div class="condition-spec">
      <span v-if="label">{{ label }}</span>
      <TypefulInputPair :label="modelValue?.shouldBeMet !== false ? 'Je splněno' : 'Není splněno'" name="shouldBeMet"
                        type="bool" placeholder="Zobrazit vždy"
                        :model-value="modelValue ? modelValue.shouldBeMet : true"
                        @update:model-value="modelValue.shouldBeMet = $event"
                        :disabled="!modelValue"

                        class="inline"
      />
    </div>
    <TypefulInputPair name="conditionType"
                      type="relation" target="typeful-executive.condition-type"
                      placeholder="Zobrazit vždy"
                      v-model="typeStr"
                      @update:selected-item="selectConditionType($event)"

                      class="inline"
    />

    <template v-if="selectedType?.argumentsSchema && modelValue?.arguments">
      <hr>

      <TypefulAutoSection
          :inputs="selectedType.argumentsSchema.properties"
          v-model="modelValue.arguments"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref, watch} from "vue"
import {Condition} from "@src/modules/TypefulExecutive/model/Condition"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import {ConditionType} from "@src/modules/TypefulExecutive/model/ConditionType"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"

export default defineComponent({
  components: {TypefulAutoSection, TypefulInputPair},
  props: {
    modelValue: {type: Object as PropType<Condition>},
    label: {type: String, default: ''},
  },
  setup(props, {emit}) {
    const typeRegistry = useTypeRegistry()

    const typeStr = computed({
      get: () => props.modelValue?.type ?? null,
      set: (value: string | null) => {
        if (!value) {
          emit('update:model-value', null)
          return
        }
        // We could maybe try pass some of the parameters over from current arguments to new arguments
        emit('update:model-value', {type: value, arguments: null})
      },
    })

    const selectedType = ref<ConditionType>(null)
    watch(() => props.modelValue, (condition) => {
      if (condition && typeof condition.shouldBeMet !== 'boolean') {
        condition.shouldBeMet = true
      }
    }, {immediate: true})

    return {
      typeStr,
      selectedType,
      selectConditionType(type: ConditionType) {
        if (type && type.name === selectedType.value?.name || !props.modelValue) {
          return
        }

        const prevValue = selectedType.value
        selectedType.value = type

        if (!type) {
          props.modelValue.arguments = {}
        } else {
          if (!props.modelValue.arguments || prevValue) {
            props.modelValue.arguments = typeRegistry.getDefaultValue(type.argumentsSchema)
          }
        }
      },
    }
  },
})
</script>

<style lang="scss">
.condition-spec {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;

  > span {
    order: 1;
  }
  input {
    order: 2;
  }
  label {
    order: 3;
  }

  [data-name="shouldBeMet"] {
    display: contents;

    input {
      width: initial;
    }
  }
}
</style>
