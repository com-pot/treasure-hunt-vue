<template>
  <h1>{{title}}</h1>
  <div class="story-content" ref="storyContent" v-html="preparedHtml"/>
  <div class="story-content logue">
    <span class="msg glow" style="--glow: limegreen;">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam distinctio doloremque maiores nihil possimus repellat soluta vitae voluptates voluptatibus! Accusamus blanditiis ex mollitia natus perferendis quis voluptates. Ex, nisi.</span>
    <span class="msg glow">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam distinctio doloremque maiores nihil possimus repellat soluta vitae voluptates voluptatibus! Accusamus blanditiis ex mollitia natus perferendis quis voluptates. Ex, nisi.</span>
    <span class="msg" style="--log-col: darkblue; --glow: limegreen">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae, consectetur consequuntur dignissimos et, exercitationem id ipsa iste necessitatibus nihil nulla possimus quae quas quis recusandae similique sint, tenetur ut voluptas!</span>
    <span class="msg glow">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam distinctio doloremque maiores nihil possimus repellat soluta vitae voluptates voluptatibus! Accusamus blanditiis ex mollitia natus perferendis quis voluptates. Ex, nisi.</span>

    <span class="msg glow breathe" style="--glow: limegreen;">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem enim error iure laboriosam sapiente tempora. Atque blanditiis dolore ea esse facilis itaque nesciunt officia pariatur qui vitae. Blanditiis, nam placeat?</span>
  </div>
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

<style lang="scss">
.story-content {
  --glow-accent: #{hsla(20deg, 100%, 75%, 1)}
}
</style>
