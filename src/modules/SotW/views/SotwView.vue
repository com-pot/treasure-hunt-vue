<template>
  <div class="sotw-view">

    <div class="node-navigation node-navigation-story" v-if="loadedNode && loadedNode.node.type === 'story'">
      <nav>
        <router-link v-if="nodeLinks.previous" :to="{name: 'sotw.NodeView', params: {nodeId: nodeLinks.previous.nodeId}}">&lt;</router-link>
      </nav>
      <nav>
        <router-link v-if="nodeLinks.next" :to="{name: 'sotw.NodeView', params: {nodeId: nodeLinks.next.nodeId}}">&gt;</router-link>
        <span v-else-if="!nodeLinks.parent">{{direction}}</span>
      </nav>
    </div>

    <SotwViewLoading v-if="viewState === 'loading'"></SotwViewLoading>

    <SotwViewStory v-else-if="viewState === 'ready' && loadedNode.node.type === 'story'" :key="nodeId"
                   :story-data="loadedNode.nodeData"
                   @sotwSignal="handleSignal"
    />

    <SotwViewMinigame v-else-if="viewState === 'ready' && loadedNode.node.type === 'minigame'" :key="nodeId"
                      :minigame-id="loadedNode.node.minigameId" :challenge-type="loadedNode.node.challengeType"
                      @sotwSignal="handleMinigameSignal"
    />

    <div class="view-error" v-else>
      <h1>Jejda</h1>
      <p>Tak tohle jsme nezvládli.</p>
    </div>

    <div class="node-navigation node-navigation-detail">
      <nav>
        <router-link v-if="nodeLinks.child" :to="{name: 'sotw.NodeView', params: {nodeId: nodeLinks.child.nodeId}}">Detail</router-link>
        <router-link v-if="nodeLinks.parent" :to="{name: 'sotw.NodeView', params: {nodeId: nodeLinks.parent.nodeId}}">Pryč</router-link>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, h, PropType, provide, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";

import {ViewState} from "../types/views";
import playerStore from "@/modules/SotW/playerStore";
import {isChallengeNode, isStoryNode, KnownSotwNode} from "../model/SotwModel";
import SotwViewLoading from "@/modules/SotW/views/SotwViewLoading.vue";

import * as viewStateStore from "@/modules/SotW/viewStateStore.ts";
import SotwViewStory from "@/modules/SotW/views/SotwViewStory.vue";
import SotwViewMinigame from "@/modules/SotW/views/SotwViewMinigame.vue";
import {SotwSignal} from "../types/game";
import AudioService from "@/modules/SotW/services/AudioService";
import {MinigameControls} from "@/modules/SotW/utils/minigameUtils";
import {hashCode} from "@/utils/stringUtils";
import {useSotwApi, useSotwAudio} from "@/modules/SotW/services"

type LoadedNode = {
  node: KnownSotwNode,
  nodeData: {[field: string]: any},
}

type GenericSignalHandler = ((...args: any) => void);

export default defineComponent({
  components: {SotwViewMinigame, SotwViewStory, SotwViewLoading},
  props: {
    nodeId: {type: String},
    node: {type: Object as PropType<KnownSotwNode>},
  },
  setup(props) {
    const sotwApi = useSotwApi()
    const $router = useRouter();
    const sotwAudio = useSotwAudio()

    const viewState = ref<ViewState>('loading');
    const node = ref<KnownSotwNode|null>(props.node || null);
    const loadedNode = ref<LoadedNode|null>(null);
    const viewData = computed(() => loadedNode.value?.nodeData)
    provide('sotw.viewData', viewData)

    const viewStateData = ref<object|null>(null);
    provide('sotw.viewStateData', viewStateData)


    async function loadNode(node: KnownSotwNode): Promise<LoadedNode|null> {
      let nodeData = {};
      if (isStoryNode(node)) {
        nodeData = await sotwApi.loadStoryPart(node.slug);
      } else if (isChallengeNode(node)) {
        nodeData = await sotwApi.loadMinigameData(node.storyNodeId, node.challengeType);
      }

      return { node, nodeData };
    }
    function loadNodeViewStateData(node: KnownSotwNode): void {
      viewStateData.value = viewStateStore.actions.loadState(node.nodeId)
    }
    function saveNodeViewStateData(): void {
      if (loadedNode.value && viewStateData.value) {
        viewStateStore.actions.saveState(loadedNode.value.node.nodeId, viewStateData.value)
      }
    }

    // watch(viewStateData, (value) => console.log("View state data: ", value), {immediate: true})

    watch(() => props.nodeId, (nodeId) => {
      if (!nodeId) {
        return
      }
      node.value = playerStore.getNode(nodeId)
    }, {immediate: true})

    watch(node, async (nodeSpec) => {
      saveNodeViewStateData()

      if (!nodeSpec) {
        console.warn("No nodeSpec")
        viewState.value = 'error';
        return;
      }

      viewState.value = 'loading';
      let node: LoadedNode|null;
      try {
        node = await loadNode(nodeSpec);
        loadNodeViewStateData(nodeSpec);
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
      const navItems: {[direction: string]: KnownSotwNode|null} = {
        previous: null,
        next: null,
        parent: null,
        child: null,
      };

      const currentNode = node.value;
      if (currentNode) {
        if (currentNode.type === 'story') {
          navItems.previous = playerStore.getNode(currentNode.nodeId, -1, 'story')
          navItems.next = playerStore.getNode(currentNode.nodeId, 1, 'story')

          navItems.child = playerStore.getNodeChild(currentNode.nodeId)
        } else {
          navItems.parent = playerStore.getNode(currentNode.storyNodeId)
        }
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
      checkSolution(value) {
        const nodeData = loadedNode.value?.nodeData
        const check = nodeData?.check

        let success
        if (!check) {
          console.warn("No check in loadedNode.nodeData", value)
          success = false
        } else {
          success = value === check
        }

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
  mounted() {
    window.addEventListener('beforeunload', this.saveNodeViewStateData)
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.saveNodeViewStateData)
  }
});
</script>

<style lang="scss">
.node-navigation {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
