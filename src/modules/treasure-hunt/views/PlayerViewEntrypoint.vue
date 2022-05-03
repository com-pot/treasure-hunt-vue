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
      <template v-for="block in progression.value?.storyPart.thContentBlocks">
        <ThContentBlock :content-item="block" view-mode="live" :saved-answer="progression.value.data?.[block.id]?.answer"

                        @expose-minigame-controls="(controls) => minigameControls.acceptMinigame(controls)"
                        @check-solution="(solution) => minigameControls.checkSolution(block.id, solution)"
        />
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
                :class="['btn', minigameControls.status === 'success' ? '-acc-success' :'-acc-vivid']"
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
import {computed, defineComponent, inject, onBeforeUnmount, onMounted, provide, watch} from "vue";
import {RouteLocationRaw, useRouter} from "vue-router";

import SotwViewStory from "./SotwViewStory.vue";
import {PlayerProgression, ProgressionData} from "../model/TreasureHuntModel"
import {createMinigameController, createViewStateController} from "../components/minigameData"
import {useApiAdapter, useSotwAudio, useTreasureHuntApi} from "../services"
import {resolveAfter} from "@src/utils/promiseUtils"
import PlayerTimeoutIndication from "../components/PlayerTimeoutIndication.vue"
import {useTimeout} from "../components/playerTimeout"
import {useGameActionExecutor} from "@src/modules/treasure-hunt/components/GameAction"
import MinigameComponent from "@src/modules/treasure-hunt/components/MinigameComponent.vue"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import ThContentBlock from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/ThContentBlock.vue"
import {useModelInstanceController} from "@src/modules/Typeful/components/useModelController"
import {PartOfStory} from "@src/modules/treasure-hunt/model/StoryPart"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"
import useCurrentTime, {timePrint} from "@src/modules/treasure-hunt/components/useCurrentTime"

export default defineComponent({
  components: {ThContentBlock, LoadingIndicator, MinigameComponent, PlayerTimeoutIndication, SotwViewStory},
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
      format: (d) => 'Zbývá zhruba ještě ' + timePrint.dateDiffUnits(timeout.end, d, {units: ['hours', 'minutes'], czechCase: 1}) + '.'
    })
    watch(() => remainingTime.time, (t) => timeout.now = t, {immediate: true})
    const activeTimeout = computed(() => progression.value?.timeout)
    watch(activeTimeout, t => timeout.applyFrom(t), {immediate: true})

    const viewStateData = createViewStateController(storeKey)
    provide('th.viewStateData', viewStateData)

    const playerProgression = inject<PlayerProgression>('player.progression')!

    watch(() => props.nodeId, async (nodeId) => {
      progression.flush()

      if (!nodeId) {
        console.warn("No nodeId")
        return
      }

      return progression.awaitValue(treasureHuntApi.loadProgressionData(nodeId))
    }, {immediate: true})

    const nodeLinks = computed(() => {
      const links: Record<string, RouteLocationRaw> = {}

      if (progression.value) {
        if (props.mode === 'challenge') {
          links.parent = {name: 'th.NodeView', params: {nodeId: props.nodeId!}}
        }
        if (props.mode === 'story' && progression.value.challenge) {
          links.child = {name: 'th.NodeView.challenge', params: {nodeId: props.nodeId!}}
        }

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

    const updateProgression = (storyParts: PartOfStory[]) => {
      playerProgression.storyParts = storyParts
      const lastStoryPart = storyParts[storyParts.length - 1]
      resolveAfter(500)
          .then(() => $router.push({name: 'th.NodeView', params: {nodeId: lastStoryPart.slug}}))

    }

    const minigameControls = createMinigameController({
      checkAnswer: (block, value) => {
        return treasureHuntApi.checkAnswer(props.nodeId!, {block, value})
      },
      evaluateResult: (result) => {
        result.evaluationEffects?.forEach(performGameAction)
        result.progression && updateProgression(result.progression)

        if (result.status === 'custom') {
          return 'idle'
        }

        if (storySelection.story === 'sotw') {
          sotwAudio.play(result.status === 'ok' ? 'minigameOk' : 'minigameKo')
        }


        return success ? 'success' : 'error'
      },
    })
    const performGameAction = useGameActionExecutor(minigameControls, $router)

    watch(() => progression.value, (progressionItem) => {
      viewStateData.load()
      minigameControls.reset = minigameControls.getValue = undefined
      minigameControls.status = progressionItem?.status === 'done' ? 'success' : 'idle'
    })

    watch(() => progression.value?.timeout, (timeoutData) => timeout.applyFrom(timeoutData), {immediate: true})

    onMounted(() => {
      window.addEventListener('beforeunload', viewStateData.save)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', viewStateData.save)
    })

    return {
      progression,
      title,

      minigameControls,
      timeout,
      remainingTime,

      performGameAction,
      nodeLinks,
    }
  },
})
</script>
