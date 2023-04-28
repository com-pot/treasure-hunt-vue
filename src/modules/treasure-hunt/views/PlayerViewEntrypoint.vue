<template>
  <LoadingIndicator v-if="progression.status === 'loading'"/>

  <div class="view-error" v-else-if="!progression.value">
    <h1>Jejda, stránku se nepodařilo načíst</h1>
    <p>Zkuste akci opakovat z
      <router-link to="/">úvodní stránky</router-link>
      .
    </p>
  </div>

  <template v-else>
    <div class="node-navigation -top">
      <router-link v-if="nodeLinks.previous" class="btn -round" :to="nodeLinks.previous">&lt;</router-link>
      <span v-else class="spacer"/>

      <h1 v-if="title">{{ title }}</h1>

      <router-link v-if="nodeLinks.next" class="btn -round" :to="nodeLinks.next">&gt;</router-link>
      <span v-else class="spacer"/>
    </div>

    <template v-if="progression.value?.storyPart.contentController === 'th-blocks'">
      <template v-for="(block, iBlock) in progression.value?.storyPart.thContentBlocks">
        <div class="section-heading story-block-separator" v-if="iBlock"><hr></div>

        <ThContentBlock :content-item="block" view-mode="live" :saved-answer="progression.value.data?.[block.id]?.answer"
                        :block-progression-data="progression.value.data?.[block.id]" :active-timeout="activeTimeout"
                        :overall-progression="progression.value"

                        @expose-minigame-controls="(controls) => minigameControls.acceptMinigame(controls)"
                        @check-solution="(solution) => minigameControls.checkSolution(block.id, solution)"
        />
        <img src="/vlm/vault-scarp.png" class="hack-image" alt="Obsah trezoru" v-if="block.id === '6704'">
        <img src="/vlm/pedro.jpg" class="hack-image" alt="Pedro" v-if="block.id === '2340'">
        <p v-if="block.id === 'f179'">
          Podklady pro složení kódu jsou k nahlédnutí v čajovně anebo <a :href="codePage" target="_blank">digitálně zde</a>.
        </p>

      </template>

      <template v-if="revealResult">
        <div class="section-heading story-block-separator"><hr></div>
        <ClueRevealResult :result="revealResult.arguments"/>
      </template>
    </template>

    <template v-else>
      <SotwViewStory v-if="progression.status === 'ready' && mode === 'story'" :key="nodeId + '-story'"
                     :story-data="progression.value.storyPart"
                     :trophies="progression.value.trophies"
                     @sotwSignal="performGameAction"
      />

      <template v-else-if="progression.status === 'ready' && mode === 'challenge'">
        <p v-html="progression.value?.challenge.description.replaceAll('\n', '<br/>')"/>
        <MinigameComponent :challenge-type="progression.value.challenge.type"
                           :challenge-config="progression.value.challenge.challengeConfig"

                           @check-solution="(solution) => minigameControls.checkSolution(null, solution)"
                           @expose-minigame-controls="minigameControls.acceptMinigame"
        />
      </template>
    </template>

    <div class="node-navigation -actions">
      <router-link v-if="nodeLinks.previous" class="btn -round" :to="nodeLinks.previous">&lt;</router-link>
      <span v-else class="spacer"/>

      <div class="nav-actions">
        <router-link class="btn" v-if="nodeLinks.child" :to="nodeLinks.child">Úkol</router-link>


        <button v-if="minigameControls.reset" @click="minigameControls.reset"
                class="btn btn-bland"
                :disabled="minigameControls.status === 'evaluating' || timeout.status === 'ticking'"
        >Začít znovu
        </button>

        <router-link class="btn" v-if="nodeLinks.parent" :to="nodeLinks.parent">Pryč</router-link>

        <button v-if="minigameControls.getValue" @click="minigameControls.checkSolution()"
                :class="['btn', minigameControls.status === 'success' ? '-acc-success' :'-acc-primary']"
                :disabled="minigameControls.status === 'evaluating' || timeout.status === 'ticking'"
        >Vyzkoušet řešení
        </button>

        <router-link :to="{name: 'th.ClueReveal'}" class="btn">🔍</router-link>
      </div>

      <router-link v-if="nodeLinks.next" class="btn -round" :to="nodeLinks.next">&gt;</router-link>
      <span v-else class="spacer"/>
    </div>
    <p v-if="mode === 'challenge' && progression.value?.status === 'done'">Tato výzva je již vyřešená</p>

    <PlayerTimeoutIndication :timeout="timeout">
      <template #timeLeft>{{remainingTime.formatted}}</template>
    </PlayerTimeoutIndication>
  </template>
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeUnmount, onMounted, provide, ref, watch} from "vue";
import {RouteLocationRaw, useRouter} from "vue-router";

import SotwViewStory from "./SotwViewStory.vue";
import {ProgressionData} from "../model/TreasureHuntModel"
import { usePlayerProgression } from "../model/playerProgression";
import {createMinigameController, createViewStateController} from "../components/minigameData"
import {useApiAdapter, useSotwAudio, useTreasureHuntApi} from "../services"
import {resolveAfter} from "@src/utils/promiseUtils"
import PlayerTimeoutIndication from "../components/PlayerTimeoutIndication.vue"
import {useTimeout} from "../components/playerTimeout"
import {useGameActionExecutor} from "@src/modules/treasure-hunt/components/GameAction"
import MinigameComponent from "@src/modules/treasure-hunt/components/MinigameComponent.vue"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import ThContentBlock from "@src/modules/treasure-hunt/content/ThContentBlock.vue"
import {useModelInstanceController} from "@src/modules/Typeful/components/useModelController"
import {PartOfStory} from "@src/modules/treasure-hunt/model/StoryPart"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import useCurrentTime, {timePrint} from "@src/modules/treasure-hunt/components/useCurrentTime"
import ClueRevealResult from "@src/modules/treasure-hunt/views/ClueRevealResult"

import codePage from "@custom/furrworld/assets/code-pages.png"

export default defineComponent({
  components: {
    ClueRevealResult,
    ThContentBlock, LoadingIndicator, MinigameComponent, PlayerTimeoutIndication, SotwViewStory,
  },
  props: {
    mode: {type: String, required: true},
    nodeId: {type: String},
  },
  setup(props) {
    const treasureHuntApi = useTreasureHuntApi()
    const $router = useRouter()
    const storySelection = useStorySelection()

    const sotwAudio = useSotwAudio()
    if (storySelection.story === 'sotw') {
      sotwAudio.preloadFiles()
          .then(() => console.log("Audio ready"))
    }

    const progression = useModelInstanceController<ProgressionData>(useApiAdapter(), 'treasure-hunt.player-progression')
    const revealResult = ref<any>(null)
    const storeKey = computed(() => {
      const storyPart = progression.value?.storyPart
      return storyPart ? `${storyPart.story}#${storyPart.slug}-${props.mode}` : null
    })
    const title = computed(() => {
      const storyPart = progression.value?.storyPart
      const mode = props.mode
      if (!storyPart) {
        return
      }

      let title = storyPart.title

      if (mode === 'challenge') {
        title += ' - Úkol'
      } else if (mode !== 'story'){
        console.warn("Unknown node mode", mode)
      }

      return title
    })

    const timeout = useTimeout()
    const remainingTime = useCurrentTime({
      format: (d) => {
        let remainingTime = timePrint.dateDiffUnits(timeout.end, d, {units: ['hours', 'minutes'], czechCase: 1})
        return 'Zbývá zhruba ještě ' + (remainingTime || 'necelá minuta') + '.'}
    })
    watch(() => remainingTime.time, (t) => timeout.now = t, {immediate: true})
    const currentProgressionTimeout = computed(() => progression.value?.timeout)
    watch(currentProgressionTimeout, t => timeout.applyFrom(t), {immediate: true})
    const activeTimeout = computed(() => {
      if (!timeout.end || timeout.end.getTime() <= remainingTime.time) {
        return null
      }

      return timeout
    })
    watch(() => activeTimeout.value?.status, (status, prevStatus) => {
      console.log({status, prevStatus})
      if (status === 'expired' || (prevStatus && !status)) {
        loadProgressionData(props.nodeId, 'keep')
      }
    })

    const viewStateData = createViewStateController(storeKey)
    provide('th.viewStateData', viewStateData)

    const playerProgression = usePlayerProgression()

    function loadProgressionData(nodeId: string, persistence: 'flush' | 'keep') {
      if (persistence === 'flush') {
        progression.flush()
        revealResult.value = null
      }

      if (!nodeId) {
        console.warn("No nodeId")
        return
      }

      if (persistence === 'keep') {
        return treasureHuntApi.loadProgressionData(nodeId)
          .then((value) => progression.value = value)
      }

      return progression.awaitValue(treasureHuntApi.loadProgressionData(nodeId))
    }
    watch(() => props.nodeId, async (nodeId) => loadProgressionData(nodeId, 'flush'),{immediate: true})

    const nodeLinks = computed(() => {
      const links: Record<string, RouteLocationRaw> = {}

      if (progression.value) {
        if (props.mode === 'challenge') {
          links.parent = {name: 'th.NodeView', params: {nodeId: props.nodeId!}}
        }
        if (props.mode === 'story' && progression.value.challenge) {
          links.child = {name: 'th.NodeView.challenge', params: {nodeId: props.nodeId!}}
        }

        console.log('PlayerViewEntrypoint', playerProgression);
        
        const currentPartIndex = playerProgression.storyParts.findIndex((sp) => sp.slug === props.nodeId)
        if (currentPartIndex > 0 && props.mode === 'story') {
          const prevPart = playerProgression.storyParts[currentPartIndex - 1]
          links.previous = {name: 'th.NodeView', params: {nodeId: prevPart.slug}}
        }
        if (currentPartIndex < playerProgression.storyParts.length - 1 && props.mode === 'story') {
          const nextPart = playerProgression.storyParts[currentPartIndex + 1]
          links.next = {name: 'th.NodeView', params: {nodeId: nextPart.slug}}
        }

      }

      return links
    })

    provide('update-view-state', () => loadProgressionData(props.nodeId, 'keep'))

    const updateProgression = (storyParts: PartOfStory[]) => {
      playerProgression.storyParts = storyParts
      const lastStoryPart = storyParts[storyParts.length - 1]

      if (props.nodeId !== lastStoryPart.slug) {
        resolveAfter(500)
            .then(() => $router.push({name: 'th.NodeView', params: {nodeId: lastStoryPart.slug}}))
      } else {
        loadProgressionData(lastStoryPart.slug, 'keep')
      }
    }

    const minigameControls = createMinigameController({
      checkAnswer: (block, value) => {
        return treasureHuntApi.checkAnswer(props.nodeId!, {block, value})
      },
      evaluateResult: (result) => {
        result.evaluationEffects?.forEach(performGameAction)
        result.progression && updateProgression(result.progression)
        revealResult.value = result.evaluationEffects?.find((effect) => effect.type === 'treasure-hunt.ui.displayContent')

        if (result.status === 'custom') {
          return 'idle'
        }

        let success = result.status === 'ok'
        if (storySelection.story === 'sotw') {
          sotwAudio.play(success ? 'minigameOk' : 'minigameKo')
        }


        return success ? 'success' : 'error'
      },
    })
    const performGameAction = useGameActionExecutor(minigameControls, $router)

    watch(() => progression.value, (progressionItem, prevItem) => {
      viewStateData.load()
      if (progressionItem?.storyPart && progressionItem?.storyPart.slug !== prevItem?.storyPart?.slug) {
        minigameControls.reset = minigameControls.getValue = undefined
      }

      minigameControls.status = progressionItem?.status === 'done' ? 'success' : 'idle'
    })

    onMounted(() => {
      window.addEventListener('beforeunload', viewStateData.save)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', viewStateData.save)
    })

    return {
      progression,
      title,
      revealResult,

      minigameControls,
      timeout,
      remainingTime,
      activeTimeout,

      performGameAction,
      nodeLinks,


      codePage,
    }
  },
})
</script>

<style lang="scss">
.section-heading.story-block-separator {
  hr {
    flex: unset;
    width: 4rem;
    margin: revert;
  }
}
.hack-image {
  width: 100%;
}
</style>
