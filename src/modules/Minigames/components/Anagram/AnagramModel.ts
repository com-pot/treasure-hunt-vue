export type InputLetter = { char: string, picked: boolean };
type LetterSelection = {sourceIndex: number};
type FreeLetter = {char: string};
export type OutputLetter = LetterSelection | FreeLetter;

export type AnagramMinigameData = {
    inputText: string,
    check: string,
};

export type AnagramMinigameState = {
    outputLetters: OutputLetter[],
}

export function isFreeLetter (letter: OutputLetter): letter is FreeLetter {
    return 'char' in letter
}
export function isLetterSelection(letter: OutputLetter): letter is LetterSelection {
    return 'sourceIndex' in letter
}
