<template>
  <div class="sotw-view">

    <div class="node-navigation -top" v-if="progNode">
      <router-link v-if="nodeLinks.previous" class="btn -round" :to="nodeLinks.previous">&lt;</router-link>
      <span v-else class="spacer"/>

      <h1 v-if="progNode.title">{{ progNode.title }}</h1>

      <router-link v-if="nodeLinks.next" class="btn -round" :to="nodeLinks.next">&gt;</router-link>
      <span v-else class="spacer"/>
    </div>

    <PlayerViewLoading v-if="componentStatus === 'loading'"/>

    <SotwViewStory v-else-if="componentStatus === 'ready' && mode === 'story'" :key="nodeId + '-story'"
                   :story-data="progNode.progression.storyPart"
                   :trophies="progNode.progression.trophies"
                   @sotwSignal="performGameAction"
    />

    <SotwViewMinigame v-else-if="componentStatus === 'ready' && mode === 'challenge'" :key="nodeId + '-challenge'"
                      :challenge-type="progNode.progression.challenge.type"
    />

    <div class="view-error" v-else>
      <h1>Jejda, stránku se nepodařilo načíst</h1>
      <p>Zkuste akci opakovat z <router-link to="/">úvodní stránky</router-link>.</p>
    </div>

    <div class="node-navigation -actions">
      <router-link v-if="nodeLinks.previous" class="btn -round" :to="nodeLinks.previous">&lt;</router-link>
      <span v-else class="spacer"/>

      <div class="nav-actions">
        <router-link class="btn" v-if="nodeLinks.child" :to="nodeLinks.child">Úkol</router-link>


        <button v-if="minigameControls.reset" @click="minigameControls.reset"
                class="btn btn-bland"
                :disabled="minigameControls.status === 'evaluating' || timeout.status === 'ticking'"
        >Začít znovu</button>

        <router-link class="btn" v-if="nodeLinks.parent" :to="nodeLinks.parent">Pryč</router-link>

        <button v-if="minigameControls.getValue" @click="minigameControls.checkSolution()"
                :class="['btn', minigameControls.status === 'success' ? 'btn-success' :'btn-vivid']"
                :disabled="minigameControls.status === 'evaluating' || timeout.status === 'ticking'"
        >Vyzkoušet řešení</button>
      </div>

      <router-link v-if="nodeLinks.next" class="btn -round" :to="nodeLinks.next">&gt;</router-link>
      <span v-else class="spacer"/>
    </div>
    <p v-if="mode === 'challenge' && progNode?.progression.status === 'done'">Tato výzva je již vyřešená</p>

    <PlayerTimeoutIndication :timeout="timeout"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, onBeforeUnmount, onMounted, provide, ref, watch} from "vue";
import {RouteLocationRaw, useRouter} from "vue-router";

import PlayerViewLoading from "./PlayerViewLoading.vue"

import * as viewStateStore from "../viewStateStore";
import SotwViewStory from "./SotwViewStory.vue";
import SotwViewMinigame from "./SotwViewMinigame.vue";
import {PlayerProgression} from "../model/TreasureHuntModel"
import {createMinigameControls} from "../components/minigameData"
import {useSotwApi, useSotwAudio} from "../services"
import {hasComponentStatus} from "@/modules/Layout/utils/componentHelpers"
import {useAlert} from "@/modules/Layout/components/viewUtils"
import {resolveAfter} from "@/utils/promiseUtils"
import {GameAction, PartOfStory, ProgressionData, TimeoutData} from "../model/TreasureHuntModel"
import PlayerTimeoutIndication from "../components/PlayerTimeoutIndication.vue"
import {useTimeout} from "../components/playerTimeout"
import {useGameLoop} from "../components/gameLoop"

type ProgressionNode = {
  title: string,
  storeKey: string,
  progression: ProgressionData,
}

export default defineComponent({
  components: {PlayerTimeoutIndication, SotwViewMinigame, SotwViewStory, PlayerViewLoading},
  props: {
    mode: {type: String, required: true},
    nodeId: {type: String},
  },
  setup(props) {
    const sotwApi = useSotwApi()
    const $router = useRouter()
    const sotwAudio = useSotwAudio()

    const alert = useAlert()

    const componentStatus = hasComponentStatus('loading');

    const progNode = ref<ProgressionNode|null>(null);

    const viewData = computed(() => {
      return props.mode === 'story' ? progNode.value?.progression.storyPart : progNode.value?.progression.challenge
    })

    provide('sotw.viewData', viewData)

    const viewStateData = ref<object|null>(null);
    provide('sotw.viewStateData', viewStateData)

    const playerProgression = inject<PlayerProgression>('player.progression')!

    async function loadNode(mode: string, slug: string): Promise<ProgressionNode> {
      const progression = await sotwApi.loadProgressionData(slug)
      let title = progression.storyPart.title

      if (mode === 'story') {
        // do nothing
      } else if (mode === 'challenge') {
        title += ' - Úkol'
      } else {
        console.warn("Unknown node mode", mode)
      }

      return {
        storeKey: slug + '.' + mode,
        progression,
        title,
      };
    }
    function loadNodeViewStateData(node: ProgressionNode): void {
      viewStateData.value = viewStateStore.actions.loadState(node.storeKey)
    }
    function saveNodeViewStateData(): void {
      if (progNode.value && viewStateData.value) {
        viewStateStore.actions.saveState(progNode.value.storeKey, viewStateData.value)
      }
    }

    watch(() => [props.nodeId, props.mode], async ([nodeId]) => {
      saveNodeViewStateData()

      if (!nodeId) {
        console.warn("No nodeId")
        componentStatus.value = 'error';
        return;
      }

      componentStatus.value = 'loading';
      progNode.value = null

      let node: ProgressionNode|null;
      try {
        node = await loadNode(props.mode, nodeId);
        loadNodeViewStateData(node);
      } catch (error) {
        console.error(error);
        node = null;
      }

      if (!node) {
        console.warn("No node")
        componentStatus.value = 'error';
        return;
      }

      progNode.value = node;
      componentStatus.value = "ready";
    }, {immediate: true});

    const nodeLinks = computed(() => {
      const links: Record<string, RouteLocationRaw> = {};

      const ln = progNode.value
      if (ln) {
        if (props.mode === 'challenge') {
          links.parent = {name: 'sotw.NodeView', params: {nodeId: props.nodeId!}}
        }
        if (props.mode === 'story' && ln.progression.challenge) {
          links.child = {name: 'sotw.NodeView.challenge', params: {nodeId: props.nodeId!}}
        }

        const currentPartIndex = playerProgression.storyParts.findIndex((sp) => sp.slug === props.nodeId)
        if (currentPartIndex > 0 && props.mode === 'story') {
          const prevPart = playerProgression.storyParts[currentPartIndex - 1]
          links.previous = {name: 'sotw.NodeView', params: {nodeId: prevPart.slug}}
        }
        if (currentPartIndex < playerProgression.storyParts.length - 1 && props.mode === 'story') {
          const nextPart = playerProgression.storyParts[currentPartIndex + 1]
          links.next = {name: 'sotw.NodeView', params: {nodeId: nextPart.slug}}
        }

      }

      return links
    })

    const gameActions: Record<string, (...action: any[]) => any> = {
      message: (text: string) => {
        alert.fire({
          toast: true,
          text: text,
          timer: 5000,
          timerProgressBar: true,
          didOpen(popup) {
            popup.addEventListener('mouseenter', alert.stopTimer)
            popup.addEventListener('mouseleave', alert.resumeTimer)
          }
        })
      },
      showForm: (formId: string) => {
        $router.push({name: "Authorization", params: {formId}})
      },
      gameState: (action: string) => {
        if (action === 'reset') {
          return minigameControls.reset?.()
        }
        console.warn("Unknown gameState action", action)
      },
    }
    const performGameAction = (args: GameAction) => {
      const type = args.shift()
      const action = gameActions[type]
      if (!action) {
        console.error("No action " + type)
        return
      }
      action.apply(undefined, args)
    }

    const updateProgression = (storyParts: PartOfStory[]) => {
      playerProgression.storyParts = storyParts
      const lastStoryPart = storyParts[storyParts.length - 1]
      resolveAfter(500)
          .then(() => $router.push({name: 'sotw.NodeView', params: {nodeId: lastStoryPart.slug}}))

    }

    const minigameControls = createMinigameControls({
      provide: true,
      checkAnswer: (value) => sotwApi.checkAnswer(props.nodeId!, {checkSum: value}),
      evaluateResult: (result) => {
        let success = result.status === 'ok' || result.status === 'already-solved'

        result.errorActions && result.errorActions.forEach(performGameAction)
        result.progression && updateProgression(result.progression)
        result.timeout && applyTimeout(result.timeout)

        sotwAudio.play(success ? 'minigameOk' : 'minigameKo')

        return success ? 'success' : 'error'
      }
    })

    const timeout = useTimeout()
    const applyTimeout = (data?: TimeoutData) => {
      timeout.start = data && data.since && new Date(data.since)
      timeout.end = data && data.until && new Date(data.until)
    }
    const gameLoop = useGameLoop(4, (t) => timeout.now = t)
    watch(progNode, (node) => {
      minigameControls.reset = minigameControls.getValue = undefined
      minigameControls.status = node?.progression.status === 'done' ? 'success' : 'idle'
    })

    watch(() => progNode.value?.progression.timeout, applyTimeout, {immediate: true})

    onMounted(() => {
      window.addEventListener('beforeunload', saveNodeViewStateData)
      gameLoop.start()
    })
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', saveNodeViewStateData)
      gameLoop.stop()
    })

    return {
      componentStatus,
      progNode,

      minigameControls,
      timeout,

      performGameAction,
      nodeLinks,
      saveNodeViewStateData,
    }
  },
})
</script>

<style lang="scss">

</style>
