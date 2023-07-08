type Destination = {key: string, name: string}
type Connection = {
    from: string, to: string,
    departures: { label?: string, time?: string }[],
}
export type TimeTablesConfig = {
    destinations: Destination[],
    connections: Connection[],

    start: string,
    finish: string,
}

export const DestinationSchema = {
    type: 'object',
    properties: {
        key: {type: 'string'},
        name: {type: 'string'},
    },
    required: ["key", "name"],
}

export const ConnectionDepartureSchema = {
    type: 'object',
    properties: {
        label: {type: 'string'},
    },
    required: ["label"],
}
export const ConnectionSchema = {
    type: 'object',
    properties: {
        from: {type: 'string'},
        to: {type: 'string'},
        departures: {
            type: 'array',
            items: ConnectionDepartureSchema,
        },
    },
}
