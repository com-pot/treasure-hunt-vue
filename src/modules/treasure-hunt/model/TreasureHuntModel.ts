import {OutputBlockData} from "@editorjs/editorjs"

export interface PartOfStory {
    slug: string,
    title: string,
    contentBlocks?: OutputBlockData[],
    contentHtml: string,
    challenge?: string,
}

export type TimeoutData = {
    since?: Date,
    until?: Date,
}
export type ChallengeData = {
    challengeConfig: Record<string, any>,
    [prop: string]: any,
}
type ProgressionChallengeData = Record<string, any>
export type TrophyData = {
    order: number
}

export type PlayerProgression = {
    storyParts: PartOfStory[],
}

export type ProgressionData = {
    status: 'new'|'done',
    timeout: TimeoutData,
    challenge: ChallengeData,
    data?: ProgressionChallengeData,
    storyPart: PartOfStory,
    trophies: TrophyData[],
}

export type GameAction = [string, ...any[]]
export type CheckResult = {
    status: 'ok'|'already-solved'|'ko',
    errorActions?: GameAction[],
    progression?: PartOfStory[],
    timeout?: TimeoutData,
}