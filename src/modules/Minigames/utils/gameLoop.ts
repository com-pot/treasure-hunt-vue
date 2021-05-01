type UpdateFn = (t: number, dt: number) => boolean

export function useGameLoop(update: UpdateFn, render: () => void, targetTicksPerSecond: number) {
    const tickTimeout = Math.round(1000 / targetTicksPerSecond)
    let animationFrameRequest: number|undefined = undefined

    let lastUpdate: number
    const tick = () => {
        const t = Date.now()
        const dt = t - lastUpdate
        lastUpdate = t

        if (!update(t, dt)) {
            return
        }

        if (animationFrameRequest) {
            console.log("Render frame skipped")
            return
        }
        animationFrameRequest = window.requestAnimationFrame(() => {
            render()
            animationFrameRequest = 0
        })
    }

    const gameLoop = {
        redrawInterval: null as number | null,
        animationFrameRequest: 0,

        start() {
            lastUpdate = Date.now()
            gameLoop.redrawInterval = setInterval(tick, tickTimeout)
        },
        stop() {
            if (gameLoop.redrawInterval) {
                clearInterval(gameLoop.redrawInterval)
                gameLoop.redrawInterval = null
            }
        },
    }

    return gameLoop
}
