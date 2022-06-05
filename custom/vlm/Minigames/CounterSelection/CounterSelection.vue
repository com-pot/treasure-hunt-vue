<template>
  <div class="counter-selection" data-theme="vlm-rps">
    <div class="arena">
      <div class="trash-talk" v-if="gameState.status === 'idle'">
        <p>
          Poraz chlapce desetkrát za sebou ve hře kámen, nůžky, papír. Jestli prohraješ, musíš začít opět
          od začátku. Pokud remizuješ, počítá se až další výhra nebo prohra. Naštěstí máš rychlé reflexy
          a tak máš čas reagovat na chlapce.

          (Dole vidíš ubíhající časový limit na reakci. Pokud nestačíš zareagovat včas, chlapec tě
          obviní, že se pokoušíš podvádět a musíš začít znovu.)
        </p>
        <button @click="gameState.start()" class="btn">Nemáš šanci!</button>
      </div>

      <div class="trash-talk" v-else-if="gameState.status === 'lost'">
        <p>Dostal jsem tě!</p>
        <button @click="gameState.start()" class="btn">To nic nedokazuje, pojď znovu</button>
      </div>

      <div class="trash-talk" v-else-if="gameState.status === 'timed-out'">
        <p>Musíš hrát, jinak ti nepomůžu.</p>
        <button @click="gameState.start()" class="btn">Jasně, jasně.. ukaž co v tobě je</button>
      </div>


      <div class="trash-talk" v-else-if="gameState.status === 'won'">
        <p>No dobře, {{ challengeConfig.winConditions.roundCount }} výher je tvých. Pojď za mnou.</p>
      </div>

      <template v-if="gameState.currentRound">
        <div class="progressbar -vertical game-progress">
          <div class="chunk -vivid" :style="`--done: ${(gameState.currentRound.num - 1) / challengeConfig.winConditions.roundCount};`"></div>
          <div class="chunk -acc-vivid" :style="`--done: ${1 / challengeConfig.winConditions.roundCount};`"></div>
        </div>

        <div class="progressbar -vertical round-time">
          <div class="chunk -vivid" :style="`--done: ${gameState.timing.total ? (1 - gameState.timing.left / gameState.timing.total) : 1};`"></div>
        </div>

        <div class="prompt">
          <img :src="gameState.currentRound.prompt.file" :alt="gameState.currentRound.prompt.alt">
        </div>

        <div class="options">
          <div class="option" v-for="option in gameState.currentRound.options" :key="option.key"
               :data-value="option.key"
               :style="`--img: url(${option.file});`"
               @click="gameState.applyCounter(option.key)"
          >
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onBeforeUnmount, onMounted, ref, watch} from "vue"
import {CounterSelectionConfig, useGameState} from "@custom/vlm/Minigames/CounterSelection/counterSelection"
import {useGameLoop} from "@src/modules/treasure-hunt/components/gameLoop"

import * as vlmRps from "./vlm-rps/vlmRps"

export default defineComponent({
  props: {
    // challengeConfig: {type: Object as PropType<CounterSelectionConfig>}
  },

  setup(props, {emit}) {
    const challengeConfig = ref<CounterSelectionConfig>({
      prompts: {
        type: 'image',
        items: [
          {
            file: vlmRps.promptRock, alt: 'Kámen', responseOptions: 'r-p-s',
            correctOption: 'paper', drawOptions: ['rock'],
          },
          {
            file: vlmRps.promptPaper, alt: 'Papír', responseOptions: 'r-p-s',
            correctOption: 'scissors', drawOptions: ['paper'],
          },
          {
            file: vlmRps.promptScissors, alt: 'Nůžky', responseOptions: 'r-p-s',
            correctOption: 'rock', drawOptions: ['scissors'],
          },
        ],

        responseOptionsTemplates: {
          'r-p-s': [
            {key: 'rock', file: vlmRps.optionRock},
            {key: 'paper', file: vlmRps.optionPaper},
            {key: 'scissors', file: vlmRps.optionScissors},
          ],
        },
      },

      winConditions: {
        type: 'streak', roundCount: 10,
        roundTime: {base: 4000, roundIncrement: -250, min: 2500},
      }
    })

    const gameState = ref<ReturnType<typeof useGameState>>(null)
    const gameLoop = useGameLoop(10, (t, dt) => {
      if (gameState.value.status === 'active') {
        gameState.value.tick(dt)
      }
    })

    onMounted((() => gameLoop.start()))
    onBeforeUnmount((() => gameLoop.start()))



    watch(challengeConfig, (config) => {
      gameState.value = useGameState(config)
    }, {immediate: true})

    watch(() => gameState.value.status, (status) => {
      if (status === 'won') {
        emit('check-solution', challengeConfig.value.winConditions.roundCount)
      }
    }, {immediate: true})


    return {
      challengeConfig,
      gameState,
    }
  },
})
</script>

<style lang="scss">
.counter-selection {
  .trash-talk {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .arena {
    display: grid;
    height: 80vh;
    width: 100%;
    grid-template-areas: 'mid';

    > * {
      grid-area: mid;
    }
  }

  .game-progress {
    place-self: stretch start;
    width: 0.5rem;
    flex-direction: column-reverse;
  }
  .round-time {
    place-self: stretch end;
    width: 0.5rem;
    flex-direction: column;
  }
  .progressbar .chunk {
    transition: all 0.1s;
  }

  .options {
    place-self: end center;

    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;

    .option {
      height: 10ch;
      width: 10ch;

      background-image: var(--img);
      background-repeat: no-repeat;
      background-size: contain;
    }
  }

  &[data-theme="vlm-rps"] {
    .prompt {
      place-self: start center;
      max-width: 90%;
      img {
        width: 100%;
        transform: rotate(0.5turn);
      }
    }
    .option[data-value="rock"] {
      filter: hue-rotate(-45deg);
    }
    .option[data-value="scissors"] {
      filter: hue-rotate(30deg);
    }
  }
}
</style>
