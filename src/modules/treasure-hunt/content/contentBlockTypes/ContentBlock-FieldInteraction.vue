<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import { useApiAdapter } from "@src/modules/treasure-hunt/services"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import contentBlockBase from "./contentBlockBase"

const props = defineProps({
  ...contentBlockBase.props,
})

const api = useApiAdapter()

const interactionData = useAsyncState(async () => {
  return {
    entries: []
  }
}, null)
</script>

<template>
    <template v-if="viewMode === 'edit'" >
      <fieldset class="form-auto-layout">
        <TypefulInputPair type="string" name="interactionKey" label="Klíč interakce"
                          v-model="block.interactionKey" />
      </fieldset>
    </template>
  
    <div class="field-interaction-block" :data-mode="viewMode" v-else>
      <router-link :to="{name: 'th.ClueReveal', query: {fieldInteraction: block.interactionKey}}" class="btn">🔍</router-link>
      <template v-if="!interactionData.isReady">
        <p>Načítám informace o interakci</p>
        <LoadingIndicator />
      </template>

      <template v-else>
        <template v-for="entry of interactionData.state.value.entries">
          <div class="interaction-entry" :data-type="entry.type">
              {{ entry }}
          </div>
        </template>
      </template>
    </div>
  </template>
  
  
  <style lang="scss">
  .field-interaction-block {
    
  }
  </style>
  