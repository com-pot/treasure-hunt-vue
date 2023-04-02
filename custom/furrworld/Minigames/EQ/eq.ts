export namespace EQ {
    export type Channel = {
        name: string,
        label: string,
        range: [number, number],
        step?: number,
        default?: number

        appearance?: string,
    }
}

type ChannelBinding = [string, number]
export type EQConfig = {
    appearance: string,

    channels: EQ.Channel[],

    bindings: Record<string, ChannelBinding[]>,
}

export type EQState = {
    knobs: Record<string, number>,
}
