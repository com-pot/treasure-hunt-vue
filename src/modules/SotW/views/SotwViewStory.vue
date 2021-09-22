<template>
  <h1>{{title}}</h1>
  <div class="story-content logue" ref="storyContent" v-html="preparedHtml"/>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";

import {PartOfStory} from "../model/SotwModel";
import {SotwSignal} from "../types/game";
import {useTextsService} from "@/modules/SotW/services"

export default defineComponent({
  emits: ['sotwSignal'],
  props: {
    storyData: {type: Object as PropType<PartOfStory>, required: true},
  },
  setup(props) {
    const textsService = useTextsService()

    const title = computed(() => props.storyData.title || 'Nadpis');
    const preparedHtml = computed(() => textsService.replaceTerms(props.storyData.contentHtml));

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
        let signalArguments = signal.split(':');
        let signalType: string = signalArguments.shift()!;

        el.addEventListener('click', (e) => {
          e.preventDefault();

          const signal: SotwSignal = { signalType, signalArguments };
          this.$emit('sotwSignal', signal);
        });
      });

    }, {immediate: true});
  }
});
</script>

<style lang="scss">
.story-content {
  --glow-accent: #{hsla(20deg, 100%, 75%, 1)}
}
</style>
