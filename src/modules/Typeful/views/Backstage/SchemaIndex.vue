<template>
  <div class="schema-index">
    <div class="toolbar">
      <a @click.prevent="schemas.load()">reload</a>
    </div>

    <div class="schema-list">
      <CodeExample v-for="(schema) in schemas.value" :key="schema.meta.entityFqn"
                   :header="schema.meta.entityFqn"
      >
        <template #default>{{ schema }}</template>
      </CodeExample>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import CodeExample from "@src/modules/Layout/components/CodeExample.vue"

export default defineComponent({
  components: {CodeExample},
  setup() {
    const api = useApiAdapter()

    const schemas = useModelCollectionController<any>(api, 'typeful.schema')
    schemas.load()


    return {
      schemas,
    }
  },
})
</script>
