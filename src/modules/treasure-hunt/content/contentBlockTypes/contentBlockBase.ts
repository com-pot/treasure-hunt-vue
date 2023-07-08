import {PropType} from "vue"

export default {
    props: {
        viewMode: {type: String as PropType<ContentBlockViewMode>, required: true},
        block: {type: Object, required: true},
        overallProgression: {type: Object},
    },
}


export type ContentBlockViewMode = 'edit' | 'preview' | 'live'
