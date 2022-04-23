<template>
  <template v-if="viewMode === 'edit'" >
    <div class="editor-container" ref="editorContainer"/>
  </template>

  <div v-else v-html="(block).html"></div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from "vue"
import contentBlockBase from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/contentBlockBase"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import useEditorJs, {
  useEditorInComponent,
  useEditorPreview,
} from "@src/modules/treasure-hunt/Backstage/components/useEditorJs"
import {OutputData} from "@editorjs/editorjs"
import editorJsToHtml from "@src/modules/treasure-hunt/utils/editorJsToHtml"

export default defineComponent({
  components: {TypefulInputPair},
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
