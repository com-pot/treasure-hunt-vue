<script lang="ts" setup>
import {computed} from "vue"
import contentBlockBase from "./contentBlockBase"

const props = defineProps({
  ...contentBlockBase.props,
  overallProgression: {type: Object},
})

const trophy = computed(() => props.overallProgression?.trophies?.find(() => true))
const sequence = computed(() => {
  if (props.viewMode !== 'live') {
    return '#'
  }

  return trophy.value?.order
})

</script>

<template>
  <div class="content-block-trophy">
    <div class="heading">Konec?</div>
    <p class="ovation">Gratulujeme k úspěšnému dokončení hry</p>
    <p class="sequence">Jsi v pořadí {{ sequence }}. hráč, který dohrál hru.</p>
    <p>
      Pro získání své zasloužené odměny prosím sleduj kanál KRAZU, kde se dozvíš, kde si
      svou výhru můžeš vyzvednout.
    </p>
  </div>
</template>

<style lang="scss">
.content-block-trophy {
  text-align: center;

  .heading {
    font-size: 3rem;
  }
  .ovation {
    text-transform: uppercase;
  }
}
</style>
