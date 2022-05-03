<template>
  <div class="minigame-configurator time-tables">
    <div class="tile" data-bg="darken">
      <TypefulList label="Destinace" :inner-type="schemas.destinations" v-model="iw.destinations"
                   :create-item="() => getSchemaDefaultValue('destinations')"
      />
    </div>

    <div class="tile" data-bg="darken">
      <TypefulList label="Spojení"
                   :inner-type="schemas.connections" v-model="iw.connections"
                   :create-item="() => getSchemaDefaultValue('connections')"
      />
    </div>

    <div class="tile" data-bg="darken">
      <TypefulInputPair label="Začátek" name="start" v-model="iw.start"
                        type="select" :options="iw.destinations"
                        :in-opts="{label: 'name', valueProp: 'key'}"
      />
      <TypefulInputPair label="Cíl" name="finish" v-model="iw.finish"
                        type="select" :options="iw.destinations"
                        :in-opts="{label: 'name', valueProp: 'key'}"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, watch} from "vue"
import {TimeTablesConfig, DestinationSchema, ConnectionSchema} from "@custom/vlm/Minigames/TimeTables/timeTablesModel"
import TypefulList from "@src/modules/Typeful/components/TypefulList.vue"
import {cloneDeep} from "lodash"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"

export default defineComponent({
  components: {TypefulInputPair, TypefulList},
  props: {
    challengeConfig: {type: Object as PropType<TimeTablesConfig>, required: true},
  },

  setup(props, {emit}) {
    const typeRegistry = useTypeRegistry()

    const schemas = {
      destinations: DestinationSchema,
      connections: ConnectionSchema,
    }

    const iw = ref<TimeTablesConfig>({connections: [], destinations: []})

    watch(() => props.challengeConfig, (config) => {
      iw.value = cloneDeep(config)
      if (!iw.value.destinations) {
        iw.value.destinations = []
      }
      if (!iw.value.connections) {
        iw.value.connections = []
      }
    }, {immediate: true})

    emit('expose-configuration-fn', () => cloneDeep(iw.value))

    return {
      iw,

      schemas,
      getSchemaDefaultValue: (schemaName: string) => typeRegistry.getDefaultValue(schemas[schemaName])
    }
  },
})
</script>

<style lang="scss">
.minigame-configurator.time-tables {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  > .tile {
    flex: 1;
    min-width: 40ch;
  }
}
</style>
