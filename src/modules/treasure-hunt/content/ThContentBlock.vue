<template>
  <ContentBlock v-if="viewMode === 'live'"
                :type="contentItem.type" v-model="contentItem.config" view-mode="live"
                v-bind="$attrs"
  />

  <div class="flow tile tile-body content-item" v-else
       data-bg="darken">
    <div class="header">
      <div class="content-type">
        {{ contentItem.type }}
      </div>
    </div>

    <div class="body tile tile-body" data-bg="brighten">
      <ContentBlock :type="contentItem.type" v-model="contentItem.config" :view-mode="viewMode"
                    v-bind="$attrs"
      />
    </div>

    <Condition
        class="tile tile-body" data-bg="brighten"
        label="Zobrazit když"
        v-model="contentItem.if"
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import Condition from "@src/modules/TypefulExecutive/components/Condition.vue"
import ContentBlock from "@src/modules/treasure-hunt/content/ContentBlock"
import contentBlockBase from "@src/modules/treasure-hunt/content/contentBlockTypes/contentBlockBase"

export default defineComponent({
  inheritAttrs: false,
  components: {ContentBlock, Condition, TypefulInputPair},
  props: {
    contentItem: {type: Object, required: true},
    viewMode: contentBlockBase.props.viewMode,
  },
})
</script>
