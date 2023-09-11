<script lang="ts" setup>
import { onMounted } from "vue"
import { useApiAdapter } from "@src/modules/treasure-hunt/services"
import { useModelService } from "../../vueUtils"
import { useModelCollectionController } from "@src/modules/Typeful/components/useModelController"
import { useDialogController } from "@src/modules/Layout/components/viewUtils"
import ModelInfo from "../../components/ModelInfo.vue"
import { resolveAfter } from "@src/utils/promiseUtils"

const models = useModelCollectionController<any>(useModelService(useApiAdapter()), 'typeful.model')
models.load()

const dialogs = useDialogController()

function displayModelInfo(model: unknown) {
  dialogs.showDialog({
    is: ModelInfo,
    props: {
      model,
    },
  })
}

</script>

<template>
  <div class="schema-index">
    <div class="section-heading">
      <h1>Rejstřík modelů</h1>

      <div class="actions">
        <button class="btn -sm" @click.prevent="models.load()">Obnovit</button>
      </div>
    </div>

    <div class="list" data-entity="typeful.model">
      <div v-for="(model) in models.value.items" :key="model.meta.entityFqn" class="tile">
        <div class="header">
          <div class="model-header">
            <span data-name="meta.name">{{ model.meta.name }}</span>
            <span data-name="meta.module">{{ model.meta.module }}</span>
          </div>
          <div class="actions">
            <router-link
              :to="{ name: 'Typeful.Collection', params: { id: model.meta.collections.default.id } }">Položky</router-link>
            <button class="btn -sm -icon" @click="displayModelInfo(model)">Info</button>
          </div>
        </div>
      </div>
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