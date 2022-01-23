<template>
  <div class="schema-index">
    <div class="toolbar">
      <a @click.prevent="schemas.reload()">reload</a>
    </div>
    <div class="schema-list">
      <div class="entry" v-for="(schema, i) in schemas.list" :key="i">
        {{ schema }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive} from "vue"
import {ComponentStatus, resolvePromiseAsStatus} from "@/modules/Layout/utils/componentHelpers"
import {useApiAdapter} from "@/modules/treasure-hunt/services"

export default defineComponent({
  setup() {
    const api = useApiAdapter()

    const schemas = reactive({
      list: [],

      status: 'loading' as ComponentStatus,
      reload() {
        schemas.status = 'loading'
        schemas.list.splice(0)
        const loadPromise = api.get<[]>('/backstage/schemas/', {devAuth: 420})
            .then((result) => {
              console.log(result)
              schemas.list = result
            })
        resolvePromiseAsStatus(loadPromise, schemas)
      },
    })

    schemas.reload()


    return {
      schemas,
    }
  },
})
</script>
