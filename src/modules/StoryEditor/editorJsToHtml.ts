import {OutputBlockData} from "@editorjs/editorjs";

type BlockTypeRenderer = (block: OutputBlockData) => string

const blockTypeRenderers: Record<string, BlockTypeRenderer> = {
    header: (block) => {
        const tag = 'h' + block.data.level
        return `<${tag}>${block.data.text}</${tag}>`
    },
    paragraph: (block) => `<p id="${block.id}">${block.data.text}</p>`,
    list: (block) => {
        const itemsHtml = block.data.items.map((item: any) => `<li>${item}</li>`).join('\n')
        return block.data.style === 'unordered' ? `<ul>${itemsHtml}</ul>` : `<ol>${itemsHtml}</ol>`
    },
}

export default function render(blocks: OutputBlockData[]) {
    let result = ''
    blocks.forEach((block) => {
        const renderer = blockTypeRenderers[block.type]
        if (!renderer) {
            console.warn("No renderer for block", block)
            return
        }
        const blockHtml = renderer(block)
        result += (result ? '\n' : '') + blockHtml
    })
    return result
}
