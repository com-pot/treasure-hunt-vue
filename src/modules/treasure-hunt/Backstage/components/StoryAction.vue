<template>
  <div class="story-action">
    <template v-if="!action">Invalid action model</template>
    <template v-else>
      <TypefulInputPair name="actionType" label="Co se stane" type="select"
                        v-model="action.type"
                        :options="actionTypes"
      />

      <template v-if="selectedActionType?.properties">
        <TypefulAutoSection :model-value="action" :inputs="selectedActionType.properties"/>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, watch} from "vue";
import TypefulInputPair from "../../../Typeful/components/TypefulInputPair";
import {useGameActionTypes} from "@src/modules/treasure-hunt/components/GameAction"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"


export default defineComponent({
  components: {TypefulAutoSection, TypefulInputPair},
  props: {
    modelValue: {type: [Object, Array], required: true},
  },

  setup(props, {emit}) {
    const actionTypes = useGameActionTypes()

    const action = computed({
      get: () => Array.isArray(props.modelValue) ? null : props.modelValue,
      set: (value) => emit('update:model-value', value),
    })

    const selectedActionType = computed(() => {
      const typeStr = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue.type
      return actionTypes.value.find((type) => type.value === typeStr)
    })

    function normalizeAction(actionSrc: unknown) {
      let normalizedValue
      if (!actionSrc) {
        normalizedValue = {}
      } else if (Array.isArray(actionSrc)) {
        normalizedValue = selectedActionType.value?.fromArray(actionSrc)
      }

      if (normalizedValue) {
        action.value = normalizedValue
      }
    }

    watch(() => props.modelValue, (value) => normalizeAction(value), {immediate: true})

    return {
      action,

      actionTypes,
      selectedActionType,
    }
  },
})
</script>
