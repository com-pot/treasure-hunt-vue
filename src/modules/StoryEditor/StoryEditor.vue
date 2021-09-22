<template>
  <div class="story-editor">
    <nav class="story-nav">
      <p class="name" v-if="!storyParts">Načítám příběh</p>
      <template v-else>
        <div class="parts" v-if="storyParts.length">
        <div class="part" :class="id === activePart && 'active'" v-for="[id, part] in storyParts" :key="id"
             @click="selectPart(id)"
        >
          <span class="name">{{ part }}</span>
        </div>
      </div>
      </template>
    </nav>

    <form class="form-story-part" v-if="activePartData" @submit.prevent>
      <div class="controls">
        <button class="btn btn-vivid" @click="savePart">Uložit</button>
        <button class="btn" :class="viewMode === 'preview' ? 'btn-success' : 'btn-vivid'" @click="toggleViewMode">Náhled</button>
      </div>

      <div class="story-meta">
        <div class="pair">
          <label for="title">Název části</label>
          <input type="text" v-model="activePartData.title">
        </div>
      </div>
    </form>





    <div class="content" :class="'view-mode-' + viewMode">
      <div class="editor" ref="elEditor"></div>
      <div class="preview logue" v-html="previewHtml"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, watch} from "vue"
import EditorJS, {OutputBlockData} from "@editorjs/editorjs";
import List from "@editorjs/list"
import Header from "@editorjs/header"


import EditorColorPlugin from "editorjs-text-color-plugin";
import {debounce} from "@/utils/timingUtils";

import {useSotwApi} from "@/modules/SotW/services";
import {useRouter} from "vue-router";
import {PartOfStory} from "@/modules/SotW/model/SotwModel";
import editorJsToHtml from "./editorJsToHtml"


export default defineComponent({
  props: {
    activePart: {type: String},
  },
  setup(props) {
    const api = useSotwApi()
    const router = useRouter()

    const elEditor = ref<null | HTMLElement>(null)
    let editorJs: EditorJS

    const storyParts = ref<[string, string][]|null>(null)
    const activePartData = ref<PartOfStory | null>(null)
    const previewHtml = ref('')
    const viewMode = ref('editor')

    api.loadStoryTitles()
        .then((parts) => {
          storyParts.value = Object.entries(parts)
        })

    function selectPart(part: string) {
      router.push({...router.currentRoute.value, query: {part}})
    }

    // TODO: API should be rendering the html
    const renderBlocks = (blocks: OutputBlockData[]) => editorJsToHtml(blocks).replaceAll('background-color', '--glow')

    const renderPreview = debounce(() => {
      editorJs.save()
          .then((data) => previewHtml.value = renderBlocks(data.blocks))
    }, 500)

    async function savePart() {
      const data = activePartData.value ? {...activePartData.value} : null
      if (!data) {
        console.warn("Nothing to save");
        return
      }
      data.contentBlocks = (await editorJs.save()).blocks
      data.contentHtml = renderBlocks(data.contentBlocks)

      const result = await api.saveStoryPart(props.activePart!, data)

      console.log(result)
    }
    function toggleViewMode() {
      viewMode.value = viewMode.value === 'editor' ? 'preview' : 'editor'
    }

    watch(() => props.activePart, (part) => {
      if (!part) {
        activePartData.value = null
        return
      }

      api.loadStoryPart(part)
          .then((partData) => activePartData.value = partData)
    }, {immediate: true})

    const initPartDataBinding = () => {
      watch(activePartData, (data) => {
        editorJs.readOnly.toggle(!data)
        editorJs.blocks.clear()

        if (!data) {
          return
        }

        let blocks = data.contentBlocks
        if (!blocks || !blocks.length) {
          debugger
          blocks = [
            {
              type: 'paragraph',
              data: {
                text: data.contentHtml.replaceAll('--glow', 'background-color'),
              },
            }
          ]
        }

        blocks.forEach((block) => {
          console.log("insert block", block.type, block.data)
          editorJs.blocks.insert(block.type, block.data)
        })

        editorJs.blocks.delete(0) // splice first blank block inserted by clear()
      }, {immediate: true})
    }

    onMounted(() => {
      let container = elEditor.value!
      editorJs = new EditorJS({
        holder: container,

        placeholder: "Další příběh začíná prvním slovem...",

        tools: {
          list: List,
          header: {
            class: Header,
            config: {
              levels: [1, 2, 3],
            },
          },
          FgColor: {
            class: EditorColorPlugin,
            config: {
              type: 'text',
            },
          },
          BgColor: {
            class: EditorColorPlugin,
            config: {
              type: 'marker',
            },
          },
        },

        onChange() {
          renderPreview()
        }
      })

      editorJs.isReady.then(() => initPartDataBinding())
    })

    return {
      elEditor,
      storyParts,
      activePartData,
      previewHtml,
      viewMode,

      selectPart,
      toggleViewMode,
      savePart,
    }
  }
})
</script>

<style lang="scss">
.story-editor {

  > *:not(:first-child) {
    margin-top: 1rem;
  }

  .parts {
    display: grid;
    grid-auto-flow: column;
    gap: 0.5rem;
    overflow-x: auto;

    .part {
      width: 8rem;
      height: 5rem;

      padding: 0.2rem;
      background: rgba(black, 0.1);

      &.active {
        background: rgba(#666, 0.4);
      }
    }
  }

  .editor {
    .codex-editor--narrow {
      margin-right: -50px;
    }
    .codex-editor__redactor {
      background: azure;
    }
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .content {
    &:not(.view-mode-editor) {
      .editor {
        display: none;
      }
    }
    &:not(.view-mode-preview) {
      .preview {
        display: none;
      }
    }
  }
}
</style>
