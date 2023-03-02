import {reactive} from "vue"
import localStorageValue from "@src/utils/localStorageValue"

const storySelection = reactive({
    story: localStorageValue('com-pot/treasure-hunt#activeStory', {default: 'vlm'}),
})

export default (): StorySelection => {
    return storySelection as StorySelection
}

export type StorySelection = {
    story: string,
}
