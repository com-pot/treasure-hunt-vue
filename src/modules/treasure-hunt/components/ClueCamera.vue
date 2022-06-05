<template>
  <div class="clue-camera" :data-status="qrScanner.status" ref="scannerContainer">
    <div class="controls" :data-status="qrScanner.status">
      <button class="btn -sm" v-if="qrScanner.status !== 'ready'" :disabled="qrScanner.status === 'error'" @click="qrScanner.start()">Start</button>
      <button class="btn -sm" v-if="qrScanner.status === 'ready'" @click="qrScanner.stop()">Stop</button>
      <div class="date" v-if="qrScanner.status === 'ready'">{{ currentTime.formatted }}</div>
      <div class="status-indicator"></div>
    </div>

    <p class="error-notice" v-if="qrScanner.status === 'error'">{{ qrMessage }}</p>
  </div>

  <form class="app-form clue-camera-fallback-form" v-if="fallbackForm"
        @submit.prevent="$emit('clue-found', userInput.clueKey)">
    <TypefulInputPair name="clueKey" label="Klíč stopy"
                      v-model="userInput.clueKey"

                      autocomplete="off"
    />

    <button class="btn" title="Vyzkoušet stopu">🔍</button>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from "vue";
import useQrScanner from "@src/modules/treasure-hunt/components/useQrScanner";
import useCurrentTime from "@src/modules/treasure-hunt/components/useCurrentTime"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"

export default defineComponent({
  components: {TypefulInputPair},
  emits: ['clue-found'],
  props: {
    fallbackForm: Boolean,
  },
  setup(props, {emit}) {
    const scannerContainer = ref<HTMLElement>(null)
    const qrScanner = useQrScanner(scannerContainer, {
      onError: (error) => {
        console.error("Failed to initialize camera: ", error)
        qrMessage.value = 'Nelze použít foťák, je povolený v nastavení?'
      },
      onDecode: (result) => {
        emit('clue-found', result.data)
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

    const userInput = reactive({
      clueKey: '',
    })


    return {
      scannerContainer,
      qrScanner,
      qrMessage,

      currentTime,

      userInput,
    }
  },
})
</script>

<style lang="scss">
.clue-camera {
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
.clue-camera-fallback-form {
  display: flex;
  gap: 0.5rem;

  .tf-pair {
    flex: 1;
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
