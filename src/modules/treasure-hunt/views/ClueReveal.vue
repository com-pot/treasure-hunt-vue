<template>
  <div class="clue-chase flow" :data-status="clue.status">
    <h1>Hledání stop</h1>

    <template v-if="clue.status === 'uninitialized'">
      <div class="scanner-container" :data-status="qrScanner.status" ref="scannerContainer">
        <div class="controls" :data-status="qrScanner.status">
          <button class="btn -sm" v-if="qrScanner.status !== 'ready'" :disabled="qrScanner.status === 'error'" @click="qrScanner.start()">Start</button>
          <button class="btn -sm" v-if="qrScanner.status === 'ready'" @click="qrScanner.stop()">Stop</button>
          <div class="date" v-if="qrScanner.status === 'ready'">{{ currentTime.formatted }}</div>
          <div class="status-indicator"></div>
        </div>
        <div class="brand"></div>
        <p class="error-notice" v-if="qrScanner.status === 'error'">{{ qrMessage }}</p>
      </div>

      <p>Pokud myslíš, že máš stopu, zadej její klíč sem a zjisti, jestli se jedná o něco užitečného.</p>
      <form id="form-clue-lookup" class="app-form" @submit.prevent="checkForClue(userInput.clueKey)">
        <TypefulInputPair name="clueKey" label="Klíč stopy"
                          v-model="userInput.clueKey"

                          autocomplete="off"
        />

        <button class="btn" title="Vyzkoušet stopu">🔍</button>
      </form>

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
import {defineComponent, reactive, ref, watch} from "vue";

import {RevealedClue, useClueInstance} from "@src/modules/treasure-hunt/model/Clue"
import {useApiAdapter} from "@src/modules/treasure-hunt/services"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import {useRouter} from "vue-router"
import {produceMutable} from "@src/utils/immutable"
import ContentBlock from "@src/modules/treasure-hunt/Backstage/components/ClueEditor/ContentBlock"
import useQrScanner from "@src/modules/treasure-hunt/components/useQrScanner"
import useCurrentTime from "@src/modules/treasure-hunt/components/useCurrentTime"
import ClueRevealResult from "@src/modules/treasure-hunt/views/ClueRevealResult"

export default defineComponent({
  components: {ClueRevealResult, ContentBlock, TypefulInputPair},
  props: {
    clueKey: {type: String, required: true},
  },
  setup(props) {
    const router = useRouter()

    const api = useApiAdapter()
    const clue = useClueInstance<RevealedClue>(api)

    const scannerContainer = ref<HTMLElement>(null)
    const qrScanner = useQrScanner(scannerContainer, {
      onError: (error) => {
        console.error("Failed to initialize camera: ", error)
        qrMessage.value = 'Nelze použít foťák, je povolený v nastavení?'
      },
      onDecode: (result) => {
        checkForClue(result.data)
      },
    })
    const qrMessage = ref<string>('')

    const pad = (n: number) => n.toString().padStart(2, '0')
    const currentTime = useCurrentTime({
      format: (d) => {
        const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDay())}`
        const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        return date + ' ' + time
      },
    })

    const checkForClue = (key: string) => {
      router.replace(produceMutable(router.currentRoute.value, (to) => {
        to.query.key = key
      }))
    }

    const userInput = reactive({
      clueKey: '',
    })

    watch(() => props.clueKey, (str) => {
      userInput.clueKey = str || ''
      str ? clue.reveal(str) : clue.flush()
    }, {immediate: true})

    return {
      clue,

      userInput,

      scannerContainer,
      qrScanner,
      qrMessage,

      currentTime,

      checkForClue,
    }
  },
})

</script>

<style lang="scss">
#form-clue-lookup {
  display: flex;
  gap: 0.5rem;

  .tf-pair {
    flex: 1;
  }
}

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
.scanner-container {
  display: grid;
  grid-template-areas: 'center';

  color: white;

  > * {
    grid-area: center;
    max-width: 100%;
  }

  video {
    place-self: stretch;
    background: black;
  }

  .controls {
    place-self: start stretch;
    z-index: 1;
    padding: 0.5rem 1rem;

    display: flex;
    gap: 1rem;
    align-items: center;

    .btn {
      margin-inline-end: auto;
    }
  }

  .error-notice {
    z-index: 1;
    place-self: end center;
  }

  .status-indicator {
    --indicator-color: var(--neutral-400);
    display: block;
    width: 1rem;
    height: 1rem;
    border-radius: 1rem;
    filter: drop-shadow(2px 2px 4px var(--indicator-color));

    background: var(--indicator-color);
  }

  &[data-status="ready"] {
    .status-indicator {
      --indicator-color: red;
      animation: status-blinking 1s infinite linear;
    }
  }
}

@keyframes status-blinking {
  0%, 90% {
    --indicator-color: red;
  }
  90% {
    --indicator-color: transparent;
  }

}
</style>
