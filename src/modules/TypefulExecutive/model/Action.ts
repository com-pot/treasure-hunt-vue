import {Condition} from "@src/modules/TypefulExecutive/model/Condition"

export type Action = {
    type: string,
    arguments: Record<string, unknown>,

    if?: Condition,
}
