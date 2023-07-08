<template>
  <div class="section-heading">
    <div>
      <h1>Editor příběhů</h1>
      <span class="add-text">{{ activePart ? `Úprava části '${activePart}'` : 'Nová část' }}</span>
    </div>
  </div>

  <div class="backstage story-editor content-auto-layout">
    <EntityPicker
        :items="storyParts.value" item-key="slug"
        :model-value="activePart" @update:model-value="selectPart"
        :add="() => selectPart()"

        loading-text="Načítám příběh" empty-text="Příběh nemá žádné části"
    >
      <template #item="{item: part}">
        <div class="name">[{{part.order}}] {{ part.title }}</div>
        <small>/{{ part.slug }}</small>
      </template>
    </EntityPicker>

    <form class="app-form form-story-part -auto-spacing" @submit.prevent>
      <fieldset class="form-auto-layout" v-if="activePartData.value">
        <TypefulInputPair name="title" type="text" label="Název" v-model="activePartData.value.title"/>

        <TypefulInputPair name="slug" type="text" label="Url klíč"
                          v-model="activePartData.value.slug"
                          :disabled="!!activePart"
        />

        <TypefulInputPair name="order" type="number" label="Pořadí" v-model="activePartData.value.order"/>
      </fieldset>

      <fieldset class="controls">
        <button class="btn -fill -acc-primary" @click="savePart">Uložit</button>
      </fieldset>

      <hr>

      <TabFrame :tabs="editorTabs" v-model="viewMode">
        <template #pane-edit>
          <div class="content" :class="'view-mode-' + viewMode" v-if="activePartData.value?.contentController === 'inline'">
            <div class="editor" ref="elEditor"></div>
          </div>

          <div v-else-if="activePartData.value">
            <TypefulList :model-value="activePartData.value.thContentBlocks">
              <template #item="{item}">
                <ThContentBlock :content-item="item" :view-mode="viewMode"/>
              </template>
            </TypefulList>

            <div class="create-options" v-if="viewMode === 'edit'">
              <button class="btn" v-for="type in activePartData.thContentBlocks.getAvailableTypes()"
                      @click.prevent="activePartData.thContentBlocks.addContent(type)">Přidat obsah [{{ type }}]</button>
            </div>
          </div>
        </template>

        <template #pane-preview>
          <div class="content" :class="'view-mode-' + viewMode">
            <div class="preview logue" v-if="activePartData.value?.contentHtml" v-html="activePartData.value?.contentHtml"></div>
            <p v-else>Náhled není k dispozici</p>
          </div>
        </template>

        <template #pane-challenge>
          <div v-if="!activePartChallenge">
            Výzva není k dispozici
          </div>

          <fieldset v-else>
            <legend>Výzva</legend>

            <TypefulInputPair name="challengeType" label="Typ výzvy" type="select"
                              v-model="activePartChallenge.type"
                              :options="challengeTypes.value"

                              value-prop="type" track-by="type" :in-opts="{label:'type'}"
                              placeholder="Bez výzvy"
            />

            <hr>
            <template v-if="selectedChallengeType?.params">
              <TypefulAutoSection v-model="activePartChallenge.challengeConfig"
                                  :inputs="selectedChallengeType.params"
              />
            </template>
            <p v-else>Tento typ výzvy nelze konfigurovat</p>

            <CodeExample header="Konfigurace - data">
              {{ activePartChallenge.challengeConfig }}
            </CodeExample>
          </fieldset>

          <fieldset v-if="activePartChallenge">
            <legend>Akce výzvy</legend>
            <em>V případě chyby</em>
            <template v-for="i in activePartChallenge.onError?.length || 0" :key="i">
              <StoryAction v-model="activePartChallenge.onError[i - 1]"/>
            </template>
          </fieldset>
        </template>
      </TabFrame>

    </form>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRef, watch} from "vue"
import {useRouter} from "vue-router";

import {OutputBlockData} from "@editorjs/editorjs";

import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import editorJsToHtml from "../../utils/editorJsToHtml"
import TypefulInput from "@src/modules/Typeful/components/TypefulInput"
import TabFrame, {TabEntry} from "@src/modules/Layout/components/Tabs/TabFrame.vue"
import {useEditorInComponent} from "@src/modules/treasure-hunt/Backstage/components/useEditorJs"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import {useChallengeTypeList} from "@src/modules/treasure-hunt/model/ChallengeType"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import CodeExample from "@src/modules/Layout/components/CodeExample.vue"
import {useChallengeInstance} from "@src/modules/treasure-hunt/model/Challenge"
import {useMinigameRegistry} from "@src/modules/treasure-hunt/utils/minigameUtils"
import StoryAction from "@src/modules/treasure-hunt/Backstage/components/StoryAction.vue"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"
import EntityPicker from "@src/modules/treasure-hunt/Backstage/views/StoryEditor/EntityPicker.vue"
import TypefulList from "@src/modules/Typeful/components/TypefulList.vue"
import {useStoryPartCollection, useStoryPartInstance} from "@src/modules/treasure-hunt/model/StoryPart"
import ThContentBlock from "@src/modules/treasure-hunt/content/ThContentBlock.vue"
import {ContentBlockViewMode} from "@src/modules/treasure-hunt/content/contentBlockTypes/contentBlockBase"
import {resolveAfter} from "@src/utils/promiseUtils"

export default defineComponent({
  components: {
    ThContentBlock,
    TypefulList,
    EntityPicker,
    TypefulAutoSection,
    StoryAction,
    CodeExample,
    TypefulInputPair,
    TabFrame,
    TypefulInput,
  },

  props: {
    activePart: {type: String},
  },

  setup(props) {
    const api = useApiAdapter()
    const router = useRouter()
    const storySelection = useStorySelection()

    const viewState = useAsyncIndicator()

    const storyParts = useStoryPartCollection(api)
    const challengeTypes = useChallengeTypeList(api)
    challengeTypes.load()

    const activePartData = useStoryPartInstance(api)
    const activePartChallenge = useChallengeInstance(api, useMinigameRegistry())
    const selectedChallengeType = computed(() => challengeTypes.value?.find((type) => type.type === activePartChallenge.value?.type))

    const editorTabs = computed(() => {
      const tabs: TabEntry[] = [
        {name: 'edit', caption: 'Obsah'},
        {name: 'preview', caption: 'Náhled'},
      ]

      if (activePartData.value?.contentController === 'inline') {
        tabs.push({name: 'challenge', caption: 'Výzva - staré'})
      } else {
        tabs[1].pane = 'edit'
      }
      return tabs
    })

    const elEditor = ref<null | HTMLElement>(null)
    useEditorInComponent(elEditor, {
      placeholder: "Další příběh začíná prvním slovem...",
      saveBeforeDestroy(data) {
        if (activePartData.value) {
          activePartData.value.contentBlocks = data.blocks
          activePartData.value.contentHtml = renderBlocks(data.blocks)
        }
      },
    }, computed(() => activePartData.getStoryPartBlocks()))

    const viewMode = ref<ContentBlockViewMode>('edit')

    const reloadStoryParts = () => {
      storyParts.fluent()
        .filter(storySelection.story ? {story: storySelection.story} : undefined)
        .load(1, 50)
        .then(() => {
          if (!storyParts.value?.find(({slug}) => slug === props.activePart)) {
            selectPart()
          }
        })
    }
    reloadStoryParts()

    function selectPart(part?: string) {
      if (part === props.activePart) {
        return
      }

      router.push({...router.currentRoute.value, query: {part}})
    }

    // TODO: API should be rendering the html
    const renderBlocks = (blocks: OutputBlockData[]) => editorJsToHtml(blocks).replaceAll('background-color', '--glow')

    function reloadPart() {
      activePartData.flush()
      activePartChallenge.flush()

      const entityPromise = props.activePart
          ? loadPart(props.activePart, storySelection.story)
          : activePartData.create({
            contentController: 'th-blocks',
          })
      viewState.awaitTask(entityPromise)
    }

    function loadPart(id: string, story?: string) {
      return activePartData.load(id, {story})
          .then((partData) => {
            return partData.challenge
                ? activePartChallenge.load(partData.challenge).catch((err) => {
                  console.error(err)
                })
                : activePartChallenge.create()
          })
    }

    async function prepareDataToSave() {
      const data = activePartData.value ? {...activePartData.value} : null

      if (!data) {
        return Promise.reject("Nothing to be saved")
      }
      if (!storySelection.story) {
        return Promise.reject('No story selected')
      }
      data.story = storySelection.story

      return data
    }

    async function savePart() {
      if (viewMode.value === 'edit') {
        viewMode.value = 'preview'
        return resolveAfter(200).then(savePart)
      }

      const modelItem = await prepareDataToSave()

      const savePromise = activePartData.persist(modelItem)

      return viewState.awaitTask(savePromise, 'saving')
        .then((result) => {
          reloadStoryParts()
          return result
        })
    }

    function maybeUpdateRoute(partSlug?: string) {
      if (partSlug && props.activePart !== partSlug) {
        const route = router.currentRoute.value
        return router.replace({...route, query: {...route.query, part: partSlug}})
      }
    }

    watch(() => storySelection.story, () => reloadStoryParts(), {immediate: true})
    watch(() => props.activePart, reloadPart, {immediate: true})

    return {
      viewState,
      elEditor,
      storyParts,
      challengeTypes,

      activePartData,
      activePartChallenge: toRef(activePartChallenge, 'value'),
      selectedChallengeType,

      editorTabs,
      viewMode,

      selectPart,
      savePart: () => savePart().then((part) => part && maybeUpdateRoute(part.slug)),
    }
  },
})
</script>

<style lang="scss">
.story-editor {
  display: flex;
  flex-direction: column;

  .parts {
    .part {
      width: 8rem;
      height: 5rem;
    }
  }

  .editor {
    .codex-editor--narrow {
      margin-right: -50px;
    }

    .codex-editor__redactor {
      background: var(--neutral-950);
    }
  }

  .content {
    &:not(.view-mode-content) {
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
