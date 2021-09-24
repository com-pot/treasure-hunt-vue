<template>
  <div class="sotw-view">

    <div class="node-navigation node-navigation-story" v-if="loadedNode && mode === 'story'">
      <nav>
        <router-link v-if="nodeLinks.previous" :to="nodeLinks.previous">&lt;</router-link>
      </nav>
      <nav>
        <router-link v-if="nodeLinks.next" :to="nodeLinks.next">&gt;</router-link>
        <span v-else-if="!nodeLinks.parent">{{direction}}</span>
      </nav>
    </div>

    <SotwViewLoading v-if="viewState === 'loading'"></SotwViewLoading>

    <SotwViewStory v-else-if="viewState === 'ready' && mode === 'story'" :key="nodeId + '-story'"
                   :story-data="loadedNode.nodeData"
                   @sotwSignal="handleSignal"
    />

    <SotwViewMinigame v-else-if="viewState === 'ready' && mode === 'challenge'" :key="nodeId + '-challenge'"
                      :challenge-type="loadedNode.nodeData.type"
                      @sotwSignal="handleMinigameSignal"
    />

    <div class="view-error" v-else>
      <h1>Jejda</h1>
      <p>Tak tohle jsme nezvládli.</p>
    </div>

    <div class="node-navigation node-navigation-detail">
      <nav>
        <router-link v-if="nodeLinks.child" :to="nodeLinks.child">Detail</router-link>
        <router-link v-if="nodeLinks.parent" :to="nodeLinks.parent">Pryč</router-link>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeUnmount, onMounted, provide, reactive, ref, watch} from "vue";
import {RouteLocationRaw, useRouter} from "vue-router";

import {ViewState} from "../types/views";
import SotwViewLoading from "@/modules/SotW/views/SotwViewLoading.vue";

import * as viewStateStore from "@/modules/SotW/viewStateStore.ts";
import SotwViewStory from "@/modules/SotW/views/SotwViewStory.vue";
import SotwViewMinigame from "@/modules/SotW/views/SotwViewMinigame.vue";
import {SotwSignal} from "../types/game";
import {MinigameControls} from "@/modules/SotW/utils/minigameUtils";
import {hashCode} from "@/utils/stringUtils";
import {useSotwApi, useSotwAudio} from "@/modules/SotW/services"

type LoadedNode = {
  storeKey: string,
  nodeData: Record<string, any>,
}

type GenericSignalHandler = ((...args: any) => void);

export default defineComponent({
  components: {SotwViewMinigame, SotwViewStory, SotwViewLoading},
  props: {
    mode: {type: String, required: true},
    nodeId: {type: String},
  },
  setup(props) {
    const sotwApi = useSotwApi()
    const $router = useRouter();
    const sotwAudio = useSotwAudio()

    const viewState = ref<ViewState>('loading');

    const loadedNode = ref<LoadedNode|null>(null);

    const viewData = computed(() => loadedNode.value?.nodeData)
    provide('sotw.viewData', viewData)

    const viewStateData = ref<object|null>(null);
    provide('sotw.viewStateData', viewStateData)


    async function loadNode(mode: string, slug: string): Promise<LoadedNode> {
      let nodeData = {};
      if (mode === 'story') {
        nodeData = await sotwApi.loadStoryPart(slug);
      } else if (mode === 'challenge') {
        nodeData = await sotwApi.loadMinigameData(slug);
      } else {
        console.warn("Unknown node mode", mode)
      }

      return { storeKey: slug + '.' + mode, nodeData };
    }
    function loadNodeViewStateData(node: LoadedNode): void {
      viewStateData.value = viewStateStore.actions.loadState(node.storeKey)
    }
    function saveNodeViewStateData(): void {
      if (loadedNode.value && viewStateData.value) {
        viewStateStore.actions.saveState(loadedNode.value.storeKey, viewStateData.value)
      }
    }

    // watch(viewStateData, (value) => console.log("View state data: ", value), {immediate: true})

    watch(() => [props.nodeId, props.mode], async ([nodeId]) => {
      saveNodeViewStateData()

      if (!nodeId) {
        console.warn("No nodeId")
        viewState.value = 'error';
        return;
      }

      viewState.value = 'loading';
      loadedNode.value = null

      let node: LoadedNode|null;
      try {
        node = await loadNode(props.mode, nodeId);
        console.log(node)
        loadNodeViewStateData(node);
      } catch (error) {
        console.error(error);
        node = null;
      }

      if (!node) {
        console.warn("No node")
        viewState.value = 'error';
        return;
      }

      loadedNode.value = node;
      viewState.value = "ready";
    }, {immediate: true});

    const nodeLinks = computed(() => {
      const navItems: Record<string, RouteLocationRaw> = {};

      const ln = loadedNode.value
      if (ln) {
        if (props.mode === 'challenge') {
          navItems.parent = {name: 'sotw.NodeView', params: {nodeId: props.nodeId!}}
        }
        if (props.mode === 'story' && ln.nodeData.challenge) {
          navItems.child = {name: 'sotw.NodeView.challenge', params: {nodeId: props.nodeId!}}
        }

        // todo: reimplement navigation
        // {name: 'sotw.NodeView', params: {nodeId: nodeLinks.next.nodeId}}

      }

      return navItems
    })

    const signalHandlers: {[signalName: string]: GenericSignalHandler} = {
      showForm: (formId: string) => {
        $router.push({
          name: "Authorization",
          params: {formId},
        });
      },
      minigame: (minigameSignal: any) => {
        if (minigameSignal.type === "success") {
          window.alert("You did done good");
        }
      },
    }

    function handleSignal(signal: SotwSignal) {
      let handler = signalHandlers[signal.signalType] as GenericSignalHandler;
      if (!handler) {
        console.warn("Signal not recognized: ", signal);
        return
      }

      if (signal.signalArguments) {
        handler.apply(undefined, signal.signalArguments);
      } else {
        handler.call(undefined);
      }
    }

    const minigameControls: MinigameControls = reactive({
      async checkSolution(value: any) {
        const result = await sotwApi.checkAnswer(props.nodeId!, {checkSum: value})
        console.log(result)
        let success = result.status === 'new'


        minigameControls.result = success ? 'success' : 'error'
        sotwAudio.play(success ? 'minigameOk' : 'minigameKo')
        return Promise.resolve(success)
      },
      serializeSolution: (value) => hashCode(value),
    })

    provide('sotw.minigameControls', minigameControls)

    function handleMinigameSignal(signal: any) {
      if (signal.type === 'success') {
        sotwAudio.play('minigameOk')
      } else {
        sotwAudio.play('minigameKo')
      }
    }

    onMounted(() => {
      window.addEventListener('beforeunload', saveNodeViewStateData)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', saveNodeViewStateData)
    })

    return {
      viewState,
      viewStateData,
      loadedNode,
      handleSignal,
      handleMinigameSignal,
      nodeLinks,
      saveNodeViewStateData,
    };
  },
});
</script>

<style lang="scss">
.node-navigation {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
