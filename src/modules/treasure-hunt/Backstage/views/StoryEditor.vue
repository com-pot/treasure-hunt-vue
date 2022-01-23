<template>
  <div class="backstage story-editor">
    <nav class="story-nav">
      <p class="name" v-if="!storyParts">Načítám příběh</p>
      <template v-else>
        <div class="parts" v-if="storyParts.length">
        <div class="part" :class="id === activePart && 'active'" v-for="[id, part] in storyParts" :key="id"
             @click="selectPart(id)"
        >
          <div class="name">{{ part }}</div>
          <small>/{{ id }}</small>
        </div>
      </div>
      </template>
    </nav>

    <form class="form-story-part" v-if="activePartData" @submit.prevent>
      <div class="controls">
        <button class="btn btn-vivid" @click="savePart">Uložit</button>
        <button class="btn" :class="viewMode === 'preview' ? 'btn-success' : 'btn-vivid'" @click="toggleViewMode">Náhled</button>
        <span>Stav: {{ viewState }}</span>
      </div>

      <div class="story-meta" style="margin-top: 0.5rem">
        <div class="pair">
          <label for="title">Název části</label>
          <input type="text" id="title" v-model="activePartData.title">
        </div>
        <div class="pair">
          <label for="slug">Hezké url</label>
          <input type="text" id="slug" v-model="activePartData.slug"/>
        </div>
        <div class="pair">
          <label for="challenge">Výzva</label>
          <TypefulInput type="select" v-model="activePartData.challenge"
                        id="challenge"

                        :options="challenges"
                        value-prop="id" track-by="id"
                        placeholder="Bez výzvy"
          >
            <template v-slot:singlelabel="{value}">{{ value.name }} - ({{ value.id }})</template>
            <template v-slot:option="{option}">{{ option.name }} - ({{ option.id }})</template>
          </TypefulInput>
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
import {useRouter} from "vue-router";

import EditorJS, {OutputBlockData} from "@editorjs/editorjs";
import List from "@editorjs/list"
import Header from "@editorjs/header"
import EditorColorPlugin from "editorjs-text-color-plugin";

import {debounce} from "@/utils/timingUtils";

import {useApiAdapter} from "@/modules/treasure-hunt/services"
import {PartOfStory} from "@/modules/treasure-hunt/model/TreasureHuntModel"
import editorJsToHtml from "../../utils/editorJsToHtml"
import TypefulInput from "@/modules/Typeful/components/TypefulInput"

export default defineComponent({
  components: {
    TypefulInput,
  },

  props: {
    activePart: {type: String},
  },

  setup(props) {
    const api = useApiAdapter()
    const router = useRouter()

    const elEditor = ref<null | HTMLElement>(null)
    let editorJs: EditorJS
    const viewState = ref('idle')

    const storyParts = ref<[string, string][]|null>(null)
    const challenges = ref<any[]>([])

    const activePartData = ref<PartOfStory | null>(null)
    const previewHtml = ref('')
    const viewMode = ref('editor')

    const reloadStoryParts = () => {
      api.get<PartOfStory[]>('backstage/treasure-hunt/story-parts')
          .then((parts) => {
            storyParts.value = parts.map((part) => [part.slug, part.title])
          })
    }
    reloadStoryParts()

    api.get<any[]>('backstage/treasure-hunt/challenges')
      .then((result) => {
        challenges.value = result
      })

    function selectPart(part: string) {
      router.push({...router.currentRoute.value, query: {part}})
    }

    // TODO: API should be rendering the html
    const renderBlocks = (blocks: OutputBlockData[]) => editorJsToHtml(blocks).replaceAll('background-color', '--glow')

    const renderPreview = debounce(() => {
      editorJs.save()
          .then((data) => previewHtml.value = renderBlocks(data.blocks))
    }, 750)

    async function savePart() {
      const data = activePartData.value ? {...activePartData.value} : null
      if (!data) {
        console.warn("Nothing to save");
        return
      }
      data.contentBlocks = (await editorJs.save()).blocks
      data.contentHtml = renderBlocks(data.contentBlocks)

      viewState.value = 'saving'
      try {
        await api.put('backstage/treasure-hunt/story-part/' + props.activePart!, data)
        viewState.value = 'ok'
        if (props.activePart !== data.slug) {
          const route = router.currentRoute.value
          reloadStoryParts()
          router.replace({...route, query: {...route.query, part: data.slug}})
        }
      } catch (e) {
        viewState.value = 'error'
        throw e
      }
    }
    function toggleViewMode() {
      viewMode.value = viewMode.value === 'editor' ? 'preview' : 'editor'
    }

    watch(() => props.activePart, (part) => {
      if (!part) {
        activePartData.value = null
        return
      }

      viewState.value = 'loading'
      api.get<PartOfStory>('backstage/treasure-hunt/story-part/' + part)
          .then((partData) => activePartData.value = partData)
          .finally(() => viewState.value = 'idle')
    }, {immediate: true})

    const initPartDataBinding = () => {
      watch(activePartData, (data) => {
        editorJs.readOnly.toggle(!data)
        editorJs.blocks.clear()

        if (!data) {
          return
        }

        console.log(data.slug)
        let blocks = data.contentBlocks
        if (!blocks || !blocks.length) {
          console.warn("Parsing content into blocks from", data)
          let content: string = data.contentHtml || (data as any).content
          blocks = [
            {
              type: 'paragraph',
              data: {
                text: content.replaceAll('--glow', 'background-color'),
              },
            }
          ]
        }

        blocks.forEach((block) => editorJs.blocks.insert(block.type, block.data))

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
      viewState,
      elEditor,
      storyParts,
      challenges,
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
