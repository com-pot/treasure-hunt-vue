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
    type: 'schema',
    fields: {
        key: {type: 'string'},
        name: {type: 'string'},
    }
}

export const ConnectionDepartureSchema = {
    type: 'schema',
    fields: {
        label: {type: 'string'},
    }
}
export const ConnectionSchema = {
    type: 'schema',
    fields: {
        from: {type: 'string'},
        to: {type: 'string'},
        departures: {
            type: 'list',
            innerType: ConnectionDepartureSchema,
        },
    },
}
