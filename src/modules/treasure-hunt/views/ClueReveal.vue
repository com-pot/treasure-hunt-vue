<script lang="ts" setup>

import {RevealedClue, useClueInstance} from "@src/modules/treasure-hunt/model/Clue"

import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useRouter} from "vue-router"
import ClueRevealResult from "@src/modules/treasure-hunt/views/ClueRevealResult"
import ClueCamera from "@src/modules/treasure-hunt/components/ClueCamera.vue"
import ContentBlock from "@src/modules/treasure-hunt/content/ContentBlock"
import {usePlayerProgression} from "@src/modules/treasure-hunt/model/playerProgression"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"

const props = defineProps({
  fieldInteraction: {type: String},
})

const api = useApiAdapter()
const playerProgression = usePlayerProgression()
const clue = useClueInstance<RevealedClue>(api, {
  onReveal: async (clue) => {
    const progressUpdate = clue.revealResults?.find((result) => result.unlockedProgression)
    if (progressUpdate) {
      await playerProgression.reload()
    }
    return clue
  },
})

const checkForClue = (key: string) => {
  clue.reveal(key)
}
const resetClueCheck = () => clue.flush()

</script>

<template>
  <div class="clue-chase flow" :data-status="clue.status">
    <h1>Hledání stop</h1>
    
    <p v-if="!fieldInteraction">
      Pokud myslíš, že máš stopu (typicky QR kód), naskenuj jí a zjisti, jestli se jedná o něco užitečného.
      Alternativně zadej ručně její kód níže.
    </p>
    <!-- <template v-else-if="false">
      <template v-if="!fieldInteraction">
        <p>Načítám informace o interakci</p>
        <LoadingIndicator />
      </template>

      <template v-else>
        <template v-for="entry of fieldInteraction.value?.entries">
          <div class="interaction-entry" :data-type="entry.type">
              {{ entry }}
          </div>
        </template>
      </template>
    </template> -->
    

    <ClueCamera @clue-found="checkForClue($event)" fallback-form/>

    <template v-if="clue.status === 'uninitialized'">

    </template>

    <template v-else-if="clue.status === 'loading'">
      <LoadingIndicator/>
    </template>

    <template v-else-if="clue.status === 'error'">
      Zde nebyla nalezena žádná stopa.
    </template>

    <section class="revealed-clue-content" v-else-if="clue.value">
      <header>
        <h2>{{ clue.value.name }}</h2>
      </header>

      <ContentBlock v-for="block in clue.value.contentBlocks"
                    :type="block.type" :model-value="block.config"
                    view-mode="live"
      />

      <template v-for="result in clue.value.revealResults || []">
        <ClueRevealResult :result="result" />
      </template>
    </section>
    <p v-else>Nepodařilo se načíst nápovědu</p>

    <nav class="clue-nav">
      <button class="btn" v-if="clue.status === 'ready'" @click.prevent="resetClueCheck()">Zpět</button>
    </nav>
  </div>
</template>



<style lang="scss">
.revealed-clue-content {
  header {
    display: flex;
    align-items: center;
    gap: 1rem;

    &:before, &:after {
      content: ''; display: block;
      height: 0.2rem;
      background-color: var(--neutral-400);

      flex: 1;
    }
  }
}
</style>
