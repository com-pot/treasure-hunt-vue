import * as Model from "./Model/CircularDominoModel";

class Stone implements Model.Stone {
    public tiles: Model.Tile[];
    constructor() {
        this.tiles = [];
    }
    addTile(bgColor: string, symbol: string): Stone {
        this.tiles.push({bgColor, symbol});
        return this;
    }
}

export default class CircularDominoApi {
    public static async loadRings(): Promise<Model.Ring[]> {
        let innerRing: Model.Ring = {
            stones: [
                new Stone().addTile("red", "0"),
                new Stone().addTile("deeppink", "1"),
                new Stone().addTile("dodgerblue", "2"),
                new Stone().addTile("red", "3"),
                new Stone().addTile("yellow", "4"),
                new Stone().addTile("dodgerblue", "5"),
            ]
        };
        let midRing: Model.Ring = {
            stones: [
                new Stone().addTile("yellow", 'R'),
                new Stone().addTile("green", 'B'),
                new Stone().addTile("dodgerblue", 'L'),
            ],
        };

        let outerRing: Model.Ring = {
            stones: [
                new Stone().addTile("green", "G"),
                new Stone().addTile("dodgerblue", "A"),
                new Stone().addTile("red", "G"),
                new Stone().addTile("dodgerblue", "B"),
                new Stone().addTile("deeppink", "G"),
                new Stone().addTile("red", "A"),
            ],
        };

        return [ innerRing, midRing, outerRing ];
    }
}
