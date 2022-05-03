import {PartOfStory} from "@src/modules/treasure-hunt/model/StoryPart"
import {Action} from "@src/modules/TypefulExecutive/model/Action"

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
    timeout?: TimeoutData,
    challenge: ChallengeData,
    data?: ProgressionChallengeData,
    storyPart: PartOfStory,
    trophies: TrophyData[],
}

export type CheckResult = {
    status: 'ok' | 'ko' | 'custom',
    evaluationEffects?: Action[],
    progression?: PartOfStory[],
}
