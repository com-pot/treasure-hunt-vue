import { Component, shallowRef } from "vue"

export function createDialogController() {
    const dialogs: Record<string, Dialog<unknown>> = {}
    const dialogStack = shallowRef<Dialog[]>([])

    let uiVoid = {
        show(id: Dialog["id"]) {
            console.error("dialogController not attached, use .bind() to init functionality")
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
            abort = async (reason) => {
                if (opts?.rejectOnAbort === false) {
                    confirm(null)
                } else {
                    rej(reason)
                }
                return reason
            }

            const validate = opts?.validateAbort
            if (validate) {
                const origAbort = abort
                abort = async (reason) => {
                    const result = await validate(reason)
                    if (!result) return
                    return origAbort(result)
                }
            }
        })
            .finally(() => {
                delete dialogs[dialog.id]
                dialogStack.value = dialogStack.value.filter((item) => item.id !== dialog.id)
            })

        const controls: DialogControls<TResult> = Object.freeze({
            abort: (event) => abort(event),
            confirm: (result) => confirm(result as any),
        })

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

    function assumeDialog(id: Dialog["id"]) {
        const dialog = dialogs[id]
        return dialog.controls
    }

    return {
        stack: dialogStack,

        showDialog,

        assumeDialog,
        bind(uiTarget: typeof ui) {
            ui = uiTarget
            return () => {
                dialogStack.value.slice()
                    .forEach((dialog) => dialog.controls.abort({ reason: "abort", src: "unbind" }))
                ui = uiVoid
            }
        },
    }
}

type AbortEvent = { reason: "abort" | "close" | string } & Record<string, unknown>
export type DialogControls<TResult = void> = {
    abort(e: AbortEvent): Promise<null | AbortEvent>,
    confirm(result: TResult): void,
}

type DialogOptions = {
    id?: string,

    rejectOnAbort?: boolean,
    validateAbort?: (abort: AbortEvent) => null | AbortEvent | Promise<null | AbortEvent>,
}
type Dialog<TResult = void> = Readonly<{
    id: string,

    content: { is: Component, props?: Record<string, unknown> },
    controls: DialogControls<TResult>,

    result: Promise<TResult>,
}>

export type DialogController = ReturnType<typeof createDialogController>
