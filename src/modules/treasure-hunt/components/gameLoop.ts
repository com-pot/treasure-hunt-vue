type UpdateFn = (t: number, dt: number) => any
type RenderFn = () => void

export function useGameLoop(targetTicksPerSecond: number, update: UpdateFn, render?: RenderFn) {
    const tickTimeout = Math.round(1000 / targetTicksPerSecond)
    let animationFrameRequest: number | undefined = undefined

    let t: number

    const tick = () => {
        let dt = Date.now() - t
        t = t + dt

        const shouldRender = update(t, dt)
        if (!shouldRender || !render) {
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
        redrawInterval: null as ReturnType<typeof setInterval> | null,

        start() {
            if (gameLoop.redrawInterval !== null) {
                console.warn("Attempted to start gameLoop while it's already running")
                return
            }
            t = Date.now()
            gameLoop.redrawInterval = setInterval(tick, tickTimeout)
            tick()
            render && render()
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
