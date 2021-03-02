import {ref} from "vue";
import * as SotwModel from "./model/SotwModel";
import {StoryNode} from "./model/SotwModel";

const storyNodes: StoryNode[] = [
    {nodeId: 's-prolog', type: "story", storyPartId: 'story-prolog', nodeStatus: "visited"},
    {nodeId: 's-a', type: "story", storyPartId: 'story-anagram', nodeStatus: "visited", minigameId: 'm-a'},
    {nodeId: 's-b', type: "story", storyPartId: 'story-remedy', nodeStatus: "visited", minigameId: 'm-b'},
    {nodeId: 's-d', type: "story", storyPartId: 'story-bubny', nodeStatus: "visited", minigameId: 'm-d'},
    {nodeId: 's-m', type: "story", storyPartId: 'story-totem', nodeStatus: "visited", minigameId: 'm-m'},
    {nodeId: 's-t', type: "story", storyPartId: 'story-tri-na-tri', nodeStatus: "visited", minigameId: 'm-t'},
    {nodeId: 's-u', type: "story", storyPartId: 'story-pochop', nodeStatus: "visited", minigameId: 'm-u'},
    {nodeId: 's-z', type: "story", storyPartId: 'story-samani', nodeStatus: "visited", minigameId: 'm-z'},
    {nodeId: 's-epilog', type: "story", storyPartId: 'story-epilog', nodeStatus: "active"},
]

const progression = ref<SotwModel.PlayerProgression>({
    revealedNodes: [
        ...storyNodes,
        {nodeId: 'm-a', type: "minigame", nodeStatus: 'active', minigameId: 'anagram'},
        {nodeId: 'm-b', type: "minigame", nodeStatus: 'active', minigameId: 'bpc'},
        {nodeId: 'm-d', type: "minigame", nodeStatus: 'active', minigameId: 'drums'},
        {nodeId: 'm-m', type: "minigame", nodeStatus: 'active', minigameId: 'mixMatch'},
        {nodeId: 'm-t', type: "minigame", nodeStatus: 'active', minigameId: 'toggleMatrix'},
        {nodeId: 'm-u', type: "minigame", nodeStatus: 'active', minigameId: 'understand'},
        {nodeId: 'm-z', type: "minigame", nodeStatus: 'active', minigameId: 'zebraFoal'},
    ],
    storyNodes,
});

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
    getNode,
    getNodeParent,
    getNodeChild,

};
