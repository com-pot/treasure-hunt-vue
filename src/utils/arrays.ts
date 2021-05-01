
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

export function minIndexBy<T>(array: T[], fn: (item: T) => any): number {
    if (!array.length) {
        return -1
    }

    let minVal = fn(array[0]), minIndex = 0
    for (let i = 1; i < array.length; i++) {
        const val = fn(array[i])
        if (val < minVal) {
            minVal = val
            minIndex = i
        }
    }

    return minIndex
}
export function minBy<T>(array: T[], fn: (item: T) => any): T|undefined {
    const index = minIndexBy(array, fn)
    return index !== -1 ? array[index] : undefined
}

export default {
    shuffleFisherYates,

    minIndexBy,
    minBy,
};
