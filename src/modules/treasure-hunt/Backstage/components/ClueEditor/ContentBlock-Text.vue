<template>
  <template v-if="viewMode === 'edit'" >
    <div class="editor-container" ref="editorContainer"/>
  </template>

  <div v-else v-html="(block).html"></div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue"
import contentBlockBase from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/contentBlockBase"
import {
  useEditorInComponent,
} from "@src/modules/treasure-hunt/Backstage/components/useEditorJs"

import editorJsToHtml from "@src/modules/treasure-hunt/utils/editorJsToHtml"

export default defineComponent({
  props: {
    ...contentBlockBase.props,
  },
  setup(props, {emit}) {
    const editorContainer = ref<HTMLElement|null>(null)

    useEditorInComponent(editorContainer, {
      placeholder: "Obsah stopy",

      saveBeforeDestroy(data) {
        emit('update:block-data', {
          blocks: data.blocks,
          html: editorJsToHtml(data.blocks),
        })
      },
    }, computed(() => props.block?.blocks))

    return {
      editorContainer,
    }
  },
})
</script>
