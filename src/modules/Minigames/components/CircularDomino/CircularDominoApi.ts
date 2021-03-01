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
                new Stone().addTile("red", "A").addTile("red", "B"),
                new Stone().addTile("deeppink", "G"),
                new Stone().addTile("blue", "B"),
                new Stone().addTile("red", "G").addTile("blue", "B").addTile("red", "G"),
                new Stone().addTile("blue", "A").addTile("deeppink", "A"),
                new Stone().addTile("blue", "G").addTile("blue", "B").addTile("deeppink", "B"),
            ]
        };
        let midRing: Model.Ring = {
            stones: [
                new Stone().addTile("yellow", '#').addTile('sandybrown', '@'),
            ],
        };

        let outerRing: Model.Ring = {
            stones: [
                new Stone().addTile("blue", "G").addTile("blue", "B").addTile("deeppink", "B"),
                new Stone().addTile("blue", "A").addTile("deeppink", "A"),
                new Stone().addTile("red", "G").addTile("blue", "B").addTile("red", "G"),
                new Stone().addTile("blue", "B"),
                new Stone().addTile("deeppink", "G"),
                new Stone().addTile("red", "A").addTile("red", "B"),
            ],
        };

        return [ innerRing, midRing, outerRing ];
    }
}
