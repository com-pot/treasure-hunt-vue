export type MinigameConfig = {
    colorSquence: {
        options: {
            label: string, value: string,
            sequence: string,
        }[],
    },
    code: {
        length: number,

    },
}
export type CkSequenceState = {
    sequence: string,
    code: string,
}
