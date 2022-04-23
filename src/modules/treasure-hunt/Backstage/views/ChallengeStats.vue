<template>
  <h1>Přehled výzev dle hráčů</h1>

  <div class="backstage -challenges">
    <div class="list">
      <div class="story-part" v-for="storyPart in storyParts" :key="storyPart.slug">
        <div class="title">{{ storyPart.title }} - /{{storyPart.slug}}</div>
        <div class="counts">
          <span class="new">Právě řeší: {{ storyPart.countByStatus.new }}</span>
          <span class="new">Pokořilo: {{ storyPart.countByStatus.done }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import useStorySelection from "@src/modules/treasure-hunt/components/useStorySelection"

type StoryPartStats = {
  title: string,
  slug: string,
  countByStatus: {new: number, done: number},
}

export default defineComponent({
  setup() {
    const api = useApiAdapter()
    const storySelection = useStorySelection()

    const storyParts = ref<StoryPartStats[]>([])

    api.get('/backstage/treasure-hunt/dashboard/story/' + storySelection.story)
      .then((res: any) => {
        storyParts.value = res.storyParts
      })

    return {
      storyParts,
    }
  },
})
</script>

<style lang="scss">

.backstage.-challenges {
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .story-part {
    padding: 0.5rem;
    border-radius: 0.2em;
    background: rgba(var(--hsl-vivid), 0.2);
    border: dimgray 2px solid;

    .title {
      font-weight: bold;
      margin-bottom: 0.25em;
    }

    .counts {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5em;
    }
  }
}

</style>
