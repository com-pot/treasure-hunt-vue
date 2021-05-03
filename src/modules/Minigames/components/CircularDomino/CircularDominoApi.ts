import * as Model from "./Model/CircularDominoModel";

class Stone implements Model.Stone {
    public tiles: Model.Tile[];
    constructor() {
        this.tiles = [];
    }
    addTile(bgColor: string, symbol: string, fgColor?: string): Stone {
        this.tiles.push({bgColor, symbol, fgColor});
        return this;
    }
}

export default class CircularDominoApi {
    public static async loadRings(): Promise<Model.Ring[]> {
        let innerRing: Model.Ring = {
            stones: [
                new Stone().addTile("red", "crow"),
                new Stone().addTile("deeppink", "goat", "yellow"),
                new Stone().addTile("dodgerblue", "sun"),
                new Stone().addTile("red", "shaman"),
                new Stone().addTile("yellow", "swallow"),
                new Stone().addTile("dodgerblue", "bird"),
            ],
            sideDrag: {
                2: -0.85,
            },
        };
        let midRing: Model.Ring = {
            stones: [
                new Stone().addTile("yellow", 'kakadu', "yellow"),
                new Stone().addTile("green", 'kakadu2'),
                new Stone().addTile("dodgerblue", 'turkey'),
            ],
            sideDrag: {
                0: 1.4,
            },
        };

        let outerRing: Model.Ring = {
            stones: [
                new Stone().addTile("green", "goat"),
                new Stone().addTile("dodgerblue", "moose"),
                new Stone().addTile("red", "turkey2"),
                new Stone().addTile("dodgerblue", "turtle", "yellow"),
                new Stone().addTile("deeppink", "sun"),
                new Stone().addTile("red", "turtle"),
            ],
            sideDrag: {
                0: 0.2,
                1: -0.9,
            },
        };

        return [ innerRing, midRing, outerRing ];
    }
}
