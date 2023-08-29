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

</script>

<template>
    <div class="dialog-stack">
        <template v-for="dialog of dialogCtrl.stack.value">
            <dialog :ref="(el) => setRef(dialog.id, el)">
                <component :is="dialog.content.is" v-bind="dialog.content.props" />
            </dialog>
        </template>
    </div>
</template>

<style lang="scss">


</style>