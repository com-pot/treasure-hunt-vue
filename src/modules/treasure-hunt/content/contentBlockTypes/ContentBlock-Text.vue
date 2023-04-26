<script lang="ts" setup>
import {computed, ref} from "vue"
import contentBlockBase from "./contentBlockBase"

import {
  useEditorInComponent,
} from "@src/modules/treasure-hunt/Backstage/components/useEditorJs"

import editorJsToHtml from "@src/modules/treasure-hunt/utils/editorJsToHtml"

const emit = defineEmits(['update:block-data'])
const props = defineProps({
  ...contentBlockBase.props,
})

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
</script>

<template>
  <template v-if="viewMode === 'edit'" >
    <div class="editor-container" ref="editorContainer"/>
  </template>

  <div v-else v-html="(block).html"></div>
</template>


