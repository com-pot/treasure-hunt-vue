import {GameAction} from "@src/modules/treasure-hunt/model/TreasureHuntModel"
import {useAlert} from "@src/modules/Layout/components/viewUtils"
import {MinigameControls} from "@src/modules/treasure-hunt/components/minigameData"
import {Router} from "vue-router"
import {ref} from "vue"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"

type ActionType<T=any> = {
    value: string, label: string,
    properties: Record<string, InputSpec>,
    fromArray: (arr: any[]) => T,
}
const types = ref<Readonly<ActionType>[]>([
    {
        value: 'message', label: "Zpráva",
        properties: {
            text: {type: 'text'},
        },
        fromArray: (arr) => ({type: arr[0], text: arr[1]}),
    },
])
export function useGameActionTypes() {
    return types
}

export function useGameActionExecutor(controls?: MinigameControls, router?: Router) {
    const alert = useAlert()

    const gameActions: Record<string, (...action: any[]) => any> = {
        message: (text: string) => {
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
        gameActions.gameState = (action: string) => {
            if (action === 'reset') {
                return controls.reset?.()
            }
            console.warn("Unknown gameState action", action)
        }
    }
    if (router) {
        gameActions.showForm = (formId: string) => {
            router.push({name: "Authorization", params: {formId}})
        }
    }

    return (args: GameAction) => {
        const type = args.shift()
        const action = gameActions[type]
        if (!action) {
            console.error("No action " + type)
            return
        }

        action.apply(undefined, args)
    }
}
