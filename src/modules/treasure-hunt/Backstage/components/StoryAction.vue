<template>
  <div class="story-action" v-if="!action">Invalid action model</div>
  <div class="story-action" v-else>

    <TypefulInputPair name="actionType" label="Co se stane" type="relation" target="typeful-executive.action-type"
                      v-model="action.type"
                      @update:selected-item="selectActionType($event)"
    />

    <template v-if="selectedActionType?.arguments && action.arguments">
      <TypefulAutoSection :model-value="action.arguments" :inputs="selectedActionType.arguments"/>
    </template>

    <Condition class="tile" data-bg="brighten"
               label="Provést když ..."
               v-model="action.if"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref, watch} from "vue";
import TypefulInputPair from "../../../Typeful/components/TypefulInputPair";
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"
import {Action} from "@src/modules/TypefulExecutive/model/Action"
import {ActionType} from "@src/modules/TypefulExecutive/model/ActionType"
import Condition from "@src/modules/TypefulExecutive/components/Condition.vue"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"


export default defineComponent({
  components: {Condition, TypefulAutoSection, TypefulInputPair},
  props: {
    modelValue: {type: Object as PropType<Action>, required: true},
  },

  setup(props, {emit}) {
    const typeRegistry = useTypeRegistry()

    const action = computed({
      get: () => Array.isArray(props.modelValue) ? null : props.modelValue,
      set: (value) => emit('update:model-value', value),
    })

    const selectedActionType = ref<ActionType>(null)

    function selectActionType(type: ActionType|null) {
      if (type && type.name === selectedActionType.value?.name) {
        return
      }

      const prevValue = selectedActionType.value
      selectedActionType.value = type

      if (!type) {
        action.value.arguments = {}
      } else {
        if (!action.value.arguments || prevValue) {
          action.value.arguments = typeRegistry.getDefaultValue({type: 'schema', fields: type.arguments})
        }
      }
    }

    return {
      action,

      selectedActionType,
      selectActionType,
    }
  },
})
</script>
