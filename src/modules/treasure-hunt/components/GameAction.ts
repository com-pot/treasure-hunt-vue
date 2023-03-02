import {useAlert} from "@src/modules/Layout/components/viewUtils"
import {MinigameControls} from "@src/modules/treasure-hunt/components/minigameData"
import {Router} from "vue-router"
import {Action} from "@src/modules/TypefulExecutive/model/Action"

export function useGameActionExecutor(controls?: MinigameControls, router?: Router) {
    const alert = useAlert()

    const gameActions: Record<string, (action: Record<string, any>) => any> = {
        message: ({text}) => {
            alert.fire({
                toast: true,
                text: text,
                timer: 5000,
                timerProgressBar: true,
                didOpen(popup) {
                    popup.addEventListener('mouseenter', alert.stopTimer)
                    popup.addEventListener('mouseleave', alert.resumeTimer)
                },
            })
        },
    }

    if (controls) {
        gameActions.gameState = ({action}) => {
            if (action === 'reset') {
                return controls.reset?.()
            }
            console.warn("Unknown gameState action", action)
        }
    }
    if (router) {
        gameActions.showForm = ({formId}) => {
            router.push({name: "Authorization", params: {formId}})
        }
    }

    return (action: Action) => {
        const actionFn = gameActions[action.type]
        if (!actionFn) {
            console.error("No action " + action.type)
            return
        }

        actionFn.apply(undefined, action.arguments)
    }
}
