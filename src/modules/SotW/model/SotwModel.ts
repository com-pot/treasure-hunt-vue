import {OutputBlockData} from "@editorjs/editorjs"

export interface StoryNode {
    nodeId: string,
    type: 'story',
    slug: string,
    challenge?: string,
}

export interface ChallengeNode {
    nodeId: string,
    storyNodeId: string,
    type: 'challenge',
    challengeType: string,
}

export type KnownSotwNode = StoryNode | ChallengeNode;
export type SotwNode = KnownSotwNode;

export interface PartOfStory {
    slug: string,
    title: string,
    contentBlocks?: OutputBlockData[],
    contentHtml: string,
    challenge?: string,
}

export type PlayerProgression = {
    revealedNodes: KnownSotwNode[],
}

export const isStoryNode = (node: SotwNode): node is StoryNode => node.type === "story"
export const isChallengeNode = (node: SotwNode): node is ChallengeNode => node.type === "challenge"

export function nodeHasName(node: SotwNode): node is KnownSotwNode {
    return 'nodeId' in node;
}

export function getNodeName(node: KnownSotwNode): string {
    if (isChallengeNode(node)) {
        return "Minigame node: " + node.challengeType;
    }

    return "Story node: " + node.slug;
}
