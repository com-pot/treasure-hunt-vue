export function useGameLoop(update: () => boolean, render: () => void) {
    let animationFrameRequest: number|undefined = undefined

    const tick = () => {
        if (!update()) {
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
            gameLoop.redrawInterval = setInterval(tick, 25)
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
