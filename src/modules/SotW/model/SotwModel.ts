export type KnownNodeStatus = 'visited' | 'active';

export interface StoryNode {
    nodeId: string,
    type: 'story',
    nodeStatus: KnownNodeStatus,
    storyPartId:  string,
    minigameId?: string,
}

export interface MinigameNode {
    nodeId: string,
    type: 'minigame',
    nodeStatus: KnownNodeStatus,
    minigameId: string,
}

export interface UnknownNode {
    type: 'unknown',
    nodeStatus: 'unknown',
}

export type KnownSotwNode = StoryNode | MinigameNode;
export type SotwNode = KnownSotwNode | UnknownNode;

export interface PartOfStory {
    storyPartId: string,
    storyTitle: string,
    /** HTML structure representing the part of story */
    storyContent: string,
}

export type PlayerProgression = {
    revealedNodes: KnownSotwNode[],
}

export const isStoryNode = (node: SotwNode): node is StoryNode => node.type === "story"

export function nodeHasName(node: SotwNode): node is KnownSotwNode {
    return 'nodeId' in node;
}

export function getNodeName(node: KnownSotwNode): string {
    if (node.type === 'minigame') {
        return "Minigame node: " + node.minigameId;
    }

    return "Story node: " + node.storyPartId;
}
