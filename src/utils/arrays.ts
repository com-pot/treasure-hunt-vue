
export function shuffleFisherYates<T>(array: T[], inPlace: boolean = true): T[] {
    inPlace || (array = array.slice());

    let count = array.length, rand, temp;
    while (count) {
        rand = Math.random() * count-- | 0;
        temp = array[count];
        array[count] = array[rand];
        array[rand] = temp
    }

    return array;
}

export default {
    shuffleFisherYates,
};
