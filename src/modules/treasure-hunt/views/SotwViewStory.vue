<template>
  <div class="story-content logue" ref="storyContent" v-html="preparedHtml"/>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";

import {TrophyData} from "../model/TreasureHuntModel"
import {PartOfStory} from "../model/StoryPart"
import useUniverseContent from "@src/modules/treasure-hunt/components/useUniverseContent"


export default defineComponent({
  emits: ['sotwSignal'],
  props: {
    storyData: {type: Object as PropType<PartOfStory>, required: true},
    trophies: {type: Object as PropType<TrophyData[]>},
  },
  setup(props) {
    const textsService = useUniverseContent()

    const trophyValues = [500, 300, 150]
    const trophy = computed(() => props.trophies && props.trophies[0])
    const interpolators: Record<string, () => string|undefined> = {
      poukaz: () => {
        if (!trophy.value) {
          return
        }
        const value = trophyValues[trophy.value.order - 1] || 50
        return trophy.value && `<img class="trophy-coupon" alt="Dárkový poukaz v hodnotě ${value} žetonů." src="/trophies/kraz-${value}.jpg"/>`
      },
      finishPlace: () => trophy.value && ('' + trophy.value.order),
    }
    const getInterpolateStr = (name: string) => {
      const interpolator = interpolators[name]
      let result = interpolator && interpolator()
      if (typeof result !== "string") {
        console.warn("Invalid interpolation for " + name)
        return '---'
      }
      return result
    }

    const title = computed(() => props.storyData.title || 'Nadpis');
    const preparedHtml = computed(() => {
      if (!props.storyData.contentHtml) {
        console.warn("storyData does not have contentHtml", props.storyData)
        return ''
      }

      let content = textsService.replaceTerms(props.storyData.contentHtml)
      content = content.replaceAll(/{{\s*(\w+)\s*}}/g, (match, name) => getInterpolateStr(name))

      return content
    });

    return {
      title,
      preparedHtml,
    };
  },
  mounted() {
    this.$watch('preparedHtml', () => {
      let storyContentEl = this.$refs.storyContent as Element;
      let signalElements = storyContentEl.querySelectorAll('a[data-sotw-signal]');

      signalElements.forEach((el) => {
        let signal = el.getAttribute('data-sotw-signal') || '';

        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.$emit('sotwSignal', signal.split(':'));
        });
      });

    }, {immediate: true});
  }
});
</script>

<style lang="scss">
.story-content {
  --glow-accent: #{hsla(20deg, 100%, 75%, 1)};

  .trophy-coupon {
    width: 100%;
    height: auto;
  }
}
</style>
