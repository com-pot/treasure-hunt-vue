import {computed, ref} from "vue";
import * as SotwModel from "./model/SotwModel";

import storyNodes from "./api/storyNodes"
import minigameNodes from "./api/minigameNodes"

const progression = ref<SotwModel.PlayerProgression>({
    revealedNodes: [
        ...storyNodes,
        ...minigameNodes,
    ],
});
export const revealedStoryNodes = computed(() => progression.value.revealedNodes.filter(SotwModel.isStoryNode))

const getNode = (nodeId: string, offset: number = 0): SotwModel.KnownSotwNode | null => {
    const foundNodeIndex = progression.value.revealedNodes
        .findIndex((n) => 'nodeId' in n && n.nodeId === nodeId);
    const requestedNodeIndex = foundNodeIndex + offset;

    if (foundNodeIndex === -1 || requestedNodeIndex < 0 || requestedNodeIndex >= progression.value.revealedNodes.length) {
        return null;
    }

    return progression.value.revealedNodes[requestedNodeIndex];
}

const getNodeParent = (nodeId: string): SotwModel.KnownSotwNode | null => {
    let parentNode = progression.value.revealedNodes.find((node) => node.minigameId === nodeId)
    return parentNode || null
}
const getNodeChild = (nodeId: string): SotwModel.KnownSotwNode | null => {
    let node = progression.value.revealedNodes.find((node) => node.nodeId === nodeId)
    if (!node || node.type !== 'story' || !node.minigameId) {
        return null
    }

    return getNode(node.minigameId)
}

export default {
    progression,
    revealedStoryNodes,
    getNode,
    getNodeParent,
    getNodeChild,

};
