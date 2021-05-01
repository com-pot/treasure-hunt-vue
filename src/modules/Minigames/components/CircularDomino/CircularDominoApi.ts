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
                new Stone().addTile("blue", "2"),
                new Stone().addTile("red", "3"),
                new Stone().addTile("blue", "4"),
                new Stone().addTile("blue", "5"),
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
                new Stone().addTile("blue", "G"),
                new Stone().addTile("blue", "A"),
                new Stone().addTile("red", "G"),
                new Stone().addTile("blue", "B"),
                new Stone().addTile("deeppink", "G"),
                new Stone().addTile("red", "A"),
            ],
        };

        return [ innerRing, midRing, outerRing ];
    }
}
