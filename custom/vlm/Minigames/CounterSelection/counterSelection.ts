import {reactive} from "vue"

type ResponseOption = { key: string, file: string }
export type CounterSelectionConfig = {
    prompts: {
        type: 'image',

        items: {
            file: string, alt: string,

            responseOptions: string | ResponseOption[],
            correctOption: string,
            drawOptions: string[],
        }[],

        responseOptionsTemplates?: Record<string, (ResponseOption[])>,
    },

    winConditions: {
        type: 'streak', roundCount: number,
        roundTime: number | { base: number, roundIncrement: number, min?: number, max?: number },
    },
}

type CurrentRound = {
    num: number,
    prompt: CounterSelectionConfig['prompts']["items"][0],

    options: ResponseOption[],
}

function shuffle<T>(arr: T[], rounds: number = 100): T[] {
    let result = arr.slice()
    for (let i = 0; i < rounds; i++) {
        let i1 = Math.floor(Math.random() * result.length)
        let i2 = Math.floor(Math.random() * result.length)

        let tmp = result[i1]
        result[i1] = result[i2]
        result[i2] = tmp
    }

    return result
}

export const useGameState = (config: CounterSelectionConfig) => {
    function setRound(round?: CurrentRound, num?: number): void {
        let r: Partial<CurrentRound> = round || {num: 0}
        r.num = num ?? 1
        r.prompt = config.prompts.items[Math.floor(Math.random() * config.prompts.items.length)]

        const options = typeof r.prompt.responseOptions === 'string'
            ? config.prompts.responseOptionsTemplates[r.prompt.responseOptions]
            : r.prompt.responseOptions
        r.options = shuffle(options)

        gameState.currentRound = r as CurrentRound
        gameState.timing.total = gameState.timing.left = getRoundTime(r.num)
    }
    const getRoundTime = (num: number): number => {
        let roundTime: number
        if (typeof config.winConditions.roundTime === 'number') {
            return config.winConditions.roundTime
        }
        const timingConfig = config.winConditions.roundTime
        roundTime = timingConfig.base + num * timingConfig.roundIncrement
        if (roundTime > timingConfig.max) {
            roundTime = timingConfig.max
        }
        if (roundTime < timingConfig.min) {
            roundTime = timingConfig.min
        }
        return roundTime
    }

    const gameState = reactive({
        status: 'idle' as 'idle' | 'active' | 'won' | 'draw' | 'lost' | 'timed-out',
        currentRound: null as CurrentRound | null,

        timing: {
            total: 0,
            left: 0,
        },

        start: () => {
            if (gameState.status === 'active') {
                return
            }
            setRound()
            gameState.status = "active"
        },

        applyCounter: (counter: string) => {
            if (!gameState.currentRound) {
                return
            }
            if (counter === gameState.currentRound.prompt.correctOption) {
                if (gameState.currentRound.num === config.winConditions.roundCount) {
                    gameState.status = 'won'
                    gameState.currentRound = null
                } else {
                    setRound(gameState.currentRound, gameState.currentRound.num + 1)
                }

                return
            }

            if (gameState.currentRound.prompt.drawOptions?.includes(counter)) {
                setRound(gameState.currentRound, gameState.currentRound.num)
                // gameState.status = 'draw'
                // gameState.currentRound = null
            } else {
                gameState.status = 'lost'
                gameState.currentRound = null
            }
        },
        tick: (dt: number) => {
            gameState.timing.left = Math.max(gameState.timing.left - dt, 0)
            if (!gameState.timing.left) {
                gameState.timing.left = gameState.timing.total
                return;

                gameState.status = 'timed-out'
                gameState.currentRound = null
            }
        },
    })

    return gameState
}
