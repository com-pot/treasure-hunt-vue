type UpdateFn = (t: number, dt: number) => boolean

export function useGameLoop(update: UpdateFn, render: () => void, targetTicksPerSecond: number) {
    const tickTimeout = Math.round(1000 / targetTicksPerSecond)
    let animationFrameRequest: number | undefined = undefined

    let t: number

    const enqueueRender = () => {
        if (animationFrameRequest) {
            console.log("Render frame skipped")
            return
        }

        animationFrameRequest = window.requestAnimationFrame(consumeRequestedAnimationFrame)
    }
    const consumeRequestedAnimationFrame = () => {
        render()
        animationFrameRequest = 0
    }

    const tick = () => {
        let dt = Date.now() - t
        t = t + dt

        if (!update(t, dt)) {
            return
        }

        enqueueRender()
    }

    const gameLoop = {
        redrawInterval: null as number | null,

        start() {
            if (gameLoop.redrawInterval !== null) {
                console.warn("Attempted to start gameLoop while it's already running")
                return
            }
            t = Date.now()
            gameLoop.redrawInterval = setInterval(tick, tickTimeout)
            consumeRequestedAnimationFrame()
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
