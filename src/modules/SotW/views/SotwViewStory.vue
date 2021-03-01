<template>
  <h1>{{title}}</h1>
  <div class="story-content" ref="storyContent" v-html="preparedHtml"/>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";
import TextsService from "@/modules/SotW/services/TextsService";

import serviceContainer from "@/modules/SotW/serviceContainer";
import {PartOfStory} from "../model/SotwModel";
import {SotwSignal} from "../types/game";

export default defineComponent({
  emits: ['sotwSignal'],
  props: {
    storyData: {type: Object as PropType<PartOfStory>, required: true},
  },
  setup(props) {
    const textsService = serviceContainer.getService<TextsService>('textsService');

    const title = computed(() => props.storyData.storyTitle || 'Nadpis');
    const preparedHtml = computed(() => textsService.replaceTerms(props.storyData.storyContent));

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

<style>

</style>
