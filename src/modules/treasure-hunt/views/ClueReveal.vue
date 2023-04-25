<template>
  <div class="clue-chase flow" :data-status="clue.status">
    <h1>Hledání stop</h1>

    <template v-if="clue.status === 'uninitialized'">
      <p>
        Pokud myslíš, že máš stopu (typicky QR kód), naskenuj jí a zjisti, jestli se jedná o něco užitečného.
        Alternativně zadej ručně její kód níže.
      </p>

      <ClueCamera @clue-found="checkForClue($event)" fallback-form/>
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
      <router-link :to="{name: 'th.ClueReveal'}" replace class="btn" v-if="clueKey">Zpět</router-link>
    </nav>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, watch} from "vue";

import {RevealedClue, useClueInstance} from "@src/modules/treasure-hunt/model/Clue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import {useRouter} from "vue-router"
import {produceMutable} from "@src/utils/immutable"
import ClueRevealResult from "@src/modules/treasure-hunt/views/ClueRevealResult"
import ClueCamera from "@src/modules/treasure-hunt/components/ClueCamera.vue"
import ContentBlock from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/ContentBlock"
import {usePlayerProgression} from "@src/modules/treasure-hunt/model/playerProgression"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"

export default defineComponent({
  components: {LoadingIndicator, ContentBlock, ClueCamera, ClueRevealResult},
  props: {
    clueKey: {type: String, required: true},
  },
  setup(props) {
    const router = useRouter()

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
      if (key === props.clueKey) {
        return
      }

      router.push(produceMutable(router.currentRoute.value, (to) => {
        to.query.key = key
      }))
    }



    watch(() => props.clueKey, (str) => {
      str ? clue.reveal(str) : clue.flush()
    }, {immediate: true})

    return {
      clue,

      checkForClue,
    }
  },
})

</script>

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
