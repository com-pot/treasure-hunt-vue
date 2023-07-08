<script lang="ts" setup>
import ClueCamera from "@src/modules/treasure-hunt/components/ClueCamera.vue"
import {RevealedClue, useClueInstance} from "@src/modules/treasure-hunt/model/Clue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import ContentBlock from "@src/modules/treasure-hunt/content/ContentBlock"
import ClueRevealResult from "@src/modules/treasure-hunt/views/ClueRevealResult"
import {usePlayerProgression} from "@src/modules/treasure-hunt/model/playerProgression"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import { useAsyncState } from "@vueuse/core"

const api = useApiAdapter()
const playerProgression = usePlayerProgression()
const currentStep = useClueInstance<RevealedClue>(api, {
  onReveal: async (clue) => {
    const progressUpdate = clue.revealResults?.find((result) => result.unlockedProgression)
    if (progressUpdate) {
      await playerProgression.reload()
    }
    return clue
  },
})

function checkForClue(key: string) {
  if (currentStep.value?.slug === key) {
    return
  }
  currentStep.reveal(key)
}

type CounterEntry = {type: 'counter', label: string}
type IndicatorDataEntry = CounterEntry

const interactionData = useAsyncState<{entries: IndicatorDataEntry[]}>(async () => {
  return {
    entries: [
      {type: 'counter', label: "Zbývá 08 dřepů"},
    ],
  }
}, null)
</script>

<template>
  <div class="mg-clue-chase flow">
    <ClueCamera @clue-found="checkForClue($event)" fallback-form/>

    <template v-if="currentStep.status === 'loading'">
      <LoadingIndicator/>
    </template>
    <div class="current-clue-contents" v-else-if="currentStep.value">
      <ContentBlock v-for="block in currentStep.value.contentBlocks"
                    :type="block.type" :model-value="block.config"
                    view-mode="live"
      />
    </div>

    <template v-for="result in currentStep.value?.revealResults || []">
      <ClueRevealResult :result="result" />
    </template>
  </div>
</template>
