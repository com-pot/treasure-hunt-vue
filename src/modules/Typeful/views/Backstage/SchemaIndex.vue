<script lang="ts" setup>
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import CodeExample from "@src/modules/Layout/components/CodeExample.vue"

const api = useApiAdapter()

const models = useModelCollectionController<any>(api, 'typeful.model')
models.load()

</script>

<template>
  <div class="schema-index">
    <div class="toolbar">
      <a @click.prevent="models.load()">reload</a>
    </div>

    <div class="schema-list">
      <CodeExample v-for="(model) in models.value" :key="model.meta.entityFqn"
                   :header="model.meta.entityFqn"
      >
        <template #default>{{ model }}</template>
      </CodeExample>
    </div>
  </div>
</template>
