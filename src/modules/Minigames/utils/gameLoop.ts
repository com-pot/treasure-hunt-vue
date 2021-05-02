type UpdateFn = (t: number, dt: number) => boolean
type RenderFn = (g: CanvasRenderingContext2D) => void

export function useGameLoop(update: UpdateFn, render: RenderFn, targetTicksPerSecond: number) {
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
        if (!gameLoop.g) {
            console.warn("Could not get graphics context")
        } else {
            render(gameLoop.g)
        }
        animationFrameRequest = 0
    }

    const tick = () => {
        let dt = Date.now() - t
        t = t+ dt

        if (!update(t, dt)) {
            return
        }

        enqueueRender()
    }

    const gameLoop = {
        g: null as CanvasRenderingContext2D | null,

        redrawInterval: null as number | null,

        start() {
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
