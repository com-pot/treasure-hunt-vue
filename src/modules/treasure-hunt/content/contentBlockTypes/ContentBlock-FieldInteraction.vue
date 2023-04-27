<script lang="ts" setup>
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import contentBlockBase from "./contentBlockBase"

const props = defineProps({
  ...contentBlockBase.props,
})

</script>

<template>
    <template v-if="viewMode === 'edit'" >
      <fieldset class="form-auto-layout">
        <TypefulInputPair type="string" name="interactionKey" label="Klíč interakce"
                          v-model="block.interactionKey" />

        <TypefulInputPair type="string" name="callToAction" label="Výzva interakce"
                          v-model="block.callToAction" />
      </fieldset>
    </template>
  
    <div class="field-interaction-block" :data-mode="viewMode" v-else>
      <router-link :to="{name: 'th.ClueReveal', query: {fieldInteraction: block.interactionKey}}" class="btn -inline">
        <span>🔍</span>
        <span class="label" v-if="block.callToAction">{{ block.callToAction }}</span>
      </router-link>
    </div>
  </template>
  
  
  <style lang="scss">
  .field-interaction-block {
    &[data-mode="live"] {
      display: flex;
      justify-content: center;
    }
  }
  </style>
  