import {OutputBlockData} from "@editorjs/editorjs"

export interface PartOfStory {
    slug: string,
    title: string,
    contentBlocks?: OutputBlockData[],
    contentHtml: string,
    challenge?: string,
}

