import { Component, shallowRef } from "vue"

export function createDialogController() {
    const dialogs: Record<string, Dialog<unknown>> = {}
    const dialogStack = shallowRef<Dialog[]>([])

    let uiVoid = {
        show(id: Dialog["id"]) {

        },
    }
    let ui = uiVoid

    function getUnusedId() {
        let id = ''
        do {
            id = 'dialog-' + Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, "0")
        } while (!!dialogs[id])

        return id
    }

    function showDialog<TResult = void>(content: Dialog<TResult>["content"], opts?: DialogOptions) {
        let confirm: DialogControls["confirm"]
        let abort: DialogControls["abort"]

        const result = new Promise<TResult>((res, rej) => {
            confirm = res as typeof confirm
            abort = opts?.rejectOnAbort === false
                ? () => confirm(null)
                : () => rej()
        })
            .finally(() => {
                delete dialogs[dialog.id]
                dialogStack.value = dialogStack.value.filter((item) => item.id !== dialog.id)
            })

        const controls: DialogControls<TResult> = {
            abort(reason = "close") {
                abort(reason)
            },
            confirm(result) {
                confirm(result as any)
            },
        }
        
        const dialog: Dialog<TResult> = {
            id: getUnusedId(),
            content,
            controls,

            result,
        }

        dialogs[dialog.id] = dialog
        dialogStack.value = [...dialogStack.value, dialog as Dialog]

        setTimeout(() => ui.show(dialog.id), 5)
        

        return dialog
    }

    return {
        stack: dialogStack,

        showDialog,

        bind(uiTarget: typeof ui) {
            ui = uiTarget
            return () => {
                dialogStack.value.slice()
                    .forEach((dialog) => dialog.controls.abort("abort"))
                ui = uiVoid
            }
        },
    }
}

export type DialogControls<TResult = void> = {
    abort(reason?: "abort" | "close"): void,
    confirm(result: TResult): void,
}

type DialogOptions = {
    id?: string,

    rejectOnAbort?: boolean,
}
type Dialog<TResult = void> = Readonly<{
    id: string,

    content: { is: Component, props?: Record<string, unknown> },
    controls: DialogControls<TResult>,

    result: Promise<TResult>,
}>

export type DialogController = ReturnType<typeof createDialogController>
