<template>
  <h1>Konfigurátor stop</h1>

  <div class="backstage clue-editor content-auto-layout">
    <EntityPicker
        :items="clues.value.items"
        item-key="slug"
        :model-value="activeClue" @update:model-value="selectClue"
        :add="() => selectClue()"
        data-layout="book"
    >
      <template #item="{item}">{{ item.name }}</template>
    </EntityPicker>

    <form class="app-form -auto-spacing -container" @submit.prevent="save" v-if="clueWorkingCopy.value">
      <fieldset class="form-auto-layout">
        <TypefulInputPair name="name" label="Název" type="text"
                          v-model="clueWorkingCopy.value.name"
        />
        <TypefulInputPair name="slug" label="Klíč"
                          v-model="clueWorkingCopy.value.slug"
                          :disabled="!!activeClue"
        />
        <TypefulInputPair name="tags" label="Vlastnosti"
                          type="list" :items="{type: 'string'}" :create-item="() => ''"
                          v-model="clueWorkingCopy.value.tags"
        />
      </fieldset>
      <fieldset class="controls">
        <button class="btn -fill -acc-primary">Uložit</button>
      </fieldset>
    </form>

    <TabFrame :tabs="clueEditorTabs" v-model="activeTab"
              v-if="clueWorkingCopy.value">
      <template #pane-content>
        <div class="section-heading -spaced -sticky">
          <div class="caption">Obsah</div>
          <div class="controls">
            <TypefulInputPair name="viewMode" type="select" mode="btn-group" size="xs"
                              :options="viewModeOptions"
                              v-model="viewMode"
            />
          </div>
        </div>

        <TypefulList :model-value="clueWorkingCopy.value.contentBlocks">
          <template #item="{item}">
            <ThContentBlock :content-item="item" :view-mode="viewMode"/>
          </template>
        </TypefulList>

        <div class="create-options" v-if="viewMode === 'edit'">
          <button class="btn" v-for="type in clueWorkingCopy.contentBlocks.getAvailableTypes()"
                  @click.prevent="clueWorkingCopy.contentBlocks.addContent(type)">Přidat obsah [{{ type }}]</button>
        </div>
      </template>

      <template #pane-actions>
        <TypefulList v-model="clueWorkingCopy.value.onReveal" label="Při odhalení"
                     :add-item="() => clueWorkingCopy.onReveal.add()">
          <template #item="{item, index}">
            <StoryAction :model-value="item" @update:model-value="clueWorkingCopy.value.onReveal[index] = $event"></StoryAction>
          </template>
        </TypefulList>
      </template>
    </TabFrame>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue"
import TypefulInput from "@src/modules/Typeful/components/TypefulInput"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import EntityPicker from "@src/modules/treasure-hunt/Backstage/views/StoryEditor/EntityPicker.vue"
import {Clue, useClueCollection, useClueInstance} from "@src/modules/treasure-hunt/model/Clue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useRouter} from "vue-router"
import TypefulList from "@src/modules/Typeful/components/TypefulList.vue"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import {produceMutable} from "@src/utils/immutable"
import {useToast} from "@src/modules/Layout/components/viewUtils"
import ThContentBlock from "src/modules/treasure-hunt/content/ThContentBlock.vue"
import {ContentBlockViewMode} from "@src/modules/treasure-hunt/content/contentBlockTypes/contentBlockBase"
import {resolveAfter} from "@src/utils/promiseUtils"
import TabFrame from "@src/modules/Layout/components/Tabs/TabFrame.vue"
import StoryAction from "@src/modules/treasure-hunt/Backstage/components/StoryAction.vue"
import {printErrorsToHtml} from "@src/utils/errors"

export default defineComponent({
  components: {StoryAction, TabFrame, ThContentBlock, TypefulList, EntityPicker, TypefulInputPair, TypefulInput},
  props: {
    activeClue: {type: String},
  },
  setup(props) {
    const api = useApiAdapter()
    const router = useRouter()
    const storySelection = useStorySelection()
    const toast = useToast()

    const viewMode = ref<ContentBlockViewMode>('edit')

    const clues = useClueCollection(api)

    const reloadClues = () => clues.load(1, 100, { story: storySelection.story })

    const viewModeOptions = ref([
      {value: 'edit', label: 'Editace'},
      {value: 'preview', label: 'Náhled'},
    ])

    const clueWorkingCopy = useClueInstance(api)
    watch(() => props.activeClue, (clue) => {
      if (!clue) {
        clueWorkingCopy.create()
            .then(() => clueWorkingCopy.value!.story = storySelection.story)
      } else {
        clueWorkingCopy.load(clue)
      }
      viewMode.value = 'edit'
    }, {immediate: true})

    watch(() => storySelection.story, () => reloadClues(), {immediate: true})

    const clueEditorTabs = ref([
      {name: 'content', caption: "Obsah"},
      {name: 'actions', caption: "Akce"},
    ])
    const activeTab = ref(null)

    function save(): Promise<Clue> {
      if (viewMode.value === 'edit') {
        viewMode.value = 'preview'
        return resolveAfter(200).then(save)
      }

      const savePromise = props.activeClue
        ? clueWorkingCopy.persist()
        : clues.createNew(clueWorkingCopy.value!)
            .then((clue) => {
              toast.success("OK", {timer: 1000})

              router.replace(produceMutable(router.currentRoute.value, (route) => {
                route.query.clue = clue.slug
              }))

              return clue
            })
      return savePromise
        .catch((err) => {
            const toastText = printErrorsToHtml(err)
            toast.error('', {title: 'Nepodařilo se uložit stopu', timer: 2000, html: toastText})

            throw err
        })
    }

    return {
      viewMode, viewModeOptions,

      clues,

      selectClue(activeClue?: string) {
        router.push({...router.currentRoute.value, query: {clue: activeClue}})
      },
      clueWorkingCopy,

      clueEditorTabs,
      activeTab,

      save,
    }
  },
})
</script>

<style lang="scss">
.clue-editor {
  .create-options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    padding: 1rem;
  }

  .section-heading {
    margin-block: 1rem;
  }
}
</style>
