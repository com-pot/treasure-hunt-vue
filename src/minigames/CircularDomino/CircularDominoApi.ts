import CircularDominoPiece from "@/minigames/CircularDomino/Model/CircularDominoPiece";

export default class CircularDominoApi {
    public static async loadPieces(): Promise<CircularDominoPiece[]> {
        return [
            new CircularDominoPiece('red', 'A', 'red', 'B'),
            new CircularDominoPiece('deeppink', 'G', 'blue', 'B'),
            new CircularDominoPiece('red', 'G', 'blue', 'A'),
            new CircularDominoPiece('deeppink', 'A', 'blue', 'G'),
            new CircularDominoPiece('blue', 'B', 'deeppink', 'B'),
        ];
    }
}
