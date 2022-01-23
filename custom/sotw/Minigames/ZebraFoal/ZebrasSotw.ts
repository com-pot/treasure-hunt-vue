import {Zebra} from "./Model/ZebraFoalModel";

export const sotwZebras: Zebra[] = [
    {
        name: 'leslie',
        helpText: "Leslie pořádá sezení a sedí vždy v čele",
        rules: [
            ['before', (mz) => mz.length === 0],
        ],
    },
    {
        name: 'andy',
        helpText: "Andy je rád, že se může účastnit, a sedne si kdekoliv",
        rules: [],
    },
    {
        name: 'ron',
        helpText: "Ron nenávidí zasedání a proto sedí za všemi ostatními",
        rules: [
            ['before', (mz) => mz.length === sotwZebras.length - 1,],
        ],
    },
    {
        name: 'tom',
        rules: [
            ['after', (mz) => mz.every((z) => z.name !== 'donna')],
        ],
    },
    {
        name: 'donna',
        rules: [
            ['before', (mz) => mz.length <= 2],
        ],
    },
    {
        name: 'april',
        helpText: "April vždy sedí za Andym",
        rules: [
            ['before', 1, (mz) => mz[0] && mz[0].name === 'andy'],
        ],
    },
];
