<script lang="ts" setup>
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import { useModelService } from "../../vueUtils"
import {useModelCollectionController} from "@src/modules/Typeful/components/useModelController"
import CodeExample from "@src/modules/Layout/components/CodeExample.vue"

const models = useModelCollectionController<any>(useModelService(useApiAdapter()), 'typeful.model')
models.load()

</script>

<template>
  <div class="schema-index">
    <div class="section-heading">
      <h1>Schema index</h1>

      <div class="actions">
        <button class="btn -sm" @click.prevent="models.load()">reload</button>
      </div>
    </div>

    <div class="list" data-entity="typeful.model">
      <CodeExample v-for="(model) in models.value.items" :key="model.meta.entityFqn"
                   class="tile"
      >
        <template #header>
          <div class="model-header">
            <span data-name="meta.name">{{ model.meta.name }}</span>
            <span data-name="meta.module">{{ model.meta.module }}</span>
          </div>
          <div class="actions">
            <router-link :to="{name: 'Typeful.Collection', params: { id: model.meta.collections.default.id }}">view</router-link>
          </div>
        </template>
        <template #default>{{ model }}</template>
      </CodeExample>
    </div>
  </div>
</template>

<style lang="scss">
.model-header {
  display: flex;
  flex-direction: column;

  [data-name="meta.module"] {
    font-size: 0.8em;
  }
}
</style>