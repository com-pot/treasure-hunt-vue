type ClueRef = {clue: string}
type ItemRef = {item: string, label: string}

type SprintConfig = {
    type: "sprint",
    checkPoints: ClueRef[],
    timeLimit: number, // TODO: Use ISO-8601 duration format
}
type RepeatConfig = {
    type: "repeat",
    count: number,
    repeatClues: ClueRef[],
}
type CollectAllConfig = {
    type: "collect-all",
    list: ItemRef[],
}
type CollectSomeConfig = {
    type: "collect-some",
    list: ItemRef[],
    n: number,
}
export type ActivityConfig = SprintConfig | RepeatConfig | CollectAllConfig | CollectSomeConfig