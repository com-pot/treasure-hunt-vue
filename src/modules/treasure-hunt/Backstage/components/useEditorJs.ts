import EditorJS, {EditorConfig, OutputBlockData, OutputData} from "@editorjs/editorjs"
import List from "@editorjs/list"
import Header from "@editorjs/header"
import EditorColorPlugin from "editorjs-text-color-plugin"
import {ComputedRef, onBeforeUnmount, onMounted, ref, Ref, watch} from "vue"

export default function useEditorJs(holder: HTMLElement, opts?: Partial<EditorConfig>) {
    return new EditorJS({
        ...opts,

        holder,

        tools: {
            list: List,
            header: {
                class: Header,
                config: {
                    levels: [1, 2, 3],
                },
            },
            FgColor: {
                class: EditorColorPlugin,
                config: {
                    type: 'text',
                },
            },
            BgColor: {
                class: EditorColorPlugin,
                config: {
                    type: 'marker',
                },
            },
        },
    })
}

type EditorInComponentOpts = Partial<EditorConfig> & {
    saveBeforeDestroy?: (data: OutputData) => void,
}
export function useEditorInComponent(holder: Ref<HTMLElement|null>, opts?: EditorInComponentOpts, blockSource?: ComputedRef<OutputBlockData[] | null>) {
    const editorRef = ref<EditorJS | null>(null)

    const watchers: ReturnType<typeof watch>[] = []
    onMounted(() => {
        let watcher = watch(holder, (holder) => {
            if (editorRef.value) {
                const saveData = opts?.saveBeforeDestroy
                saveData && editorRef.value.save().then(saveData)

                editorRef.value.destroy()
                editorRef.value = null
            }

            if (holder) {
                const editorJs = useEditorJs(holder, {
                    ...opts,
                    onReady() {
                        editorRef.value = editorJs
                    },
                })
            }
        }, {immediate: true})
        watchers.push(watcher)

        if (blockSource) {
            watcher = watch(editorRef, (editor) => {
                editor && setTimeout(() => putBlocksToEditor(blockSource.value), 150)
            })
            watchers.push(watcher)
            watchers.push(watch(blockSource, (blocks) => {
                editorRef.value?.isReady.then(() => putBlocksToEditor(blocks))
            }, {immediate: true}))
        }
    })
    onBeforeUnmount(() => {
        watchers.forEach((watcher) => watcher())
        watchers.splice(0)
    })

    async function putBlocksToEditor(blocks: OutputBlockData[] | null) {
        const editor = editorRef.value
        if (!editor || !editor.readOnly) {
            console.error('EditorJS not ready')
            return
        }

        editor.blocks.clear()

        if (blocks?.length) {
            await editor.render({blocks})
        }
    }

    return {
        editorRef,
    }
}
export function useEditorPreview() {
    return ref<{blocks: OutputBlockData[], html: string}|null>(null)
}
