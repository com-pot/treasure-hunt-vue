export type LockDigitOptionsSpec = 'alpha' | 'num' | string[] | number[]
export type LockDigit = {
    options: LockDigitOptionsSpec,
}
export type CombinationLockMinigameData = {
    digits: LockDigit[],
}
