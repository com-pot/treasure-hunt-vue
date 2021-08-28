import {computed, ref} from "vue";
import * as SotwModel from "./model/SotwModel";
import {KnownSotwNode} from "./model/SotwModel"

const progression = ref<SotwModel.PlayerProgression>({
    revealedNodes: [],
});
export const revealedStoryNodes = computed(() => progression.value.revealedNodes.filter(SotwModel.isStoryNode))

const getNode = (nodeId: string, offset: number = 0, type?: KnownSotwNode["type"]): SotwModel.KnownSotwNode | null => {
    let nodes = progression.value.revealedNodes
    if (type) {
        nodes = nodes.filter((n) => n.type === type)
    }

    const foundNodeIndex = nodes.findIndex((n) => 'nodeId' in n && n.nodeId === nodeId);
    const requestedNodeIndex = foundNodeIndex + offset;

    if (foundNodeIndex === -1 || requestedNodeIndex < 0 || requestedNodeIndex >= nodes.length) {
        return null;
    }

    return nodes[requestedNodeIndex];
}

const getNodeChild = (nodeId: string): SotwModel.KnownSotwNode | null => {
    console.log(nodeId)
    let node = progression.value.revealedNodes
        .find((node) => {
            console.log(node.type, SotwModel.isChallengeNode(node))
            return SotwModel.isChallengeNode(node) && node.storyNodeId === nodeId;
        })

    return node || null
}

export default {
    progression,
    revealedStoryNodes,
    getNode,
    getNodeChild,

};
