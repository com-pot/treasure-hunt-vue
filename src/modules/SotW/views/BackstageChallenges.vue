<template>
  <BackstageNavigation/>

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
import BackstageNavigation from "../components/BackstageNavigation.vue"
import {useApiAdapter} from "@/modules/SotW/services"

export default defineComponent({
  components: {BackstageNavigation},

  setup() {
    const api = useApiAdapter()

    const storyParts = ref([])

    api.get('/backstage/treasure-hunt/dashboard/story', {story: 'sotw'})
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
@import "~@/sass/vars/colors";

.backstage.-challenges {
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .story-part {
    padding: 0.5rem;
    border-radius: 0.2em;
    background: rgba($vivid, 0.2);
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
