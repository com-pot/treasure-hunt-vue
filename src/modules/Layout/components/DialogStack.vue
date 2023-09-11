<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { useDialogController } from "../components/viewUtils"

const dialogCtrl = useDialogController()
const dialogs: Record<string, any> = {}

onMounted(() => {
    dialogCtrl.bind({
        show(id) {
            const el = dialogs[id]
            if (!(el instanceof HTMLDialogElement)) {
                console.warn("Dialog not ready", id, el);
                return
            }
            el.showModal()
        },
    })
})

function setRef(id: string, el: unknown) {
    dialogs[id] = el
}

async function onCancel(id: string, e: Event) {
    const controls = dialogCtrl.assumeDialog(id)

    const resultPromise = controls.abort({ reason: "close", src: "cancel" })

    if (!resultPromise) return

    e.preventDefault()
}
function onClick(id: string, e: MouseEvent) {
    const target = e.currentTarget as HTMLElement
    if (isWithin(e, target.getBoundingClientRect())) return

    dialogCtrl.assumeDialog(id)
        .abort({ reason: "close", src: "click:backdrop" })
}

function isWithin(p: {x: number, y: number}, box: {x: number, y: number, width: number, height: number}): boolean {
    return p.x >= box.x && p.x <= box.x + box.width
        &&
        p.y >= box.y && p.y <= box.y + box.height
}

</script>

<template>
    <div class="dialog-stack">
        <template v-for="dialog of dialogCtrl.stack.value" :key="dialog.id">
            <dialog :ref="(el) => setRef(dialog.id, el)"
                @click="onClick(dialog.id, $event)"
                @cancel="onCancel(dialog.id, $event)"
            >
                <component :is="dialog.content.is" v-bind="dialog.content.props" />
            </dialog>
        </template>
    </div>
</template>
