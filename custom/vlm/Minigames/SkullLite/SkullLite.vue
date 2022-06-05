<template>
  <div class="mg-skull-lite flow">
    <div class="card-area">
      <template v-for="(card, i) in skullLite.currentRound.cards" :key="`${skullLite.currentRound.num}-${i}`">
        <div class="card" :class="asyncIndicator.status === 'loading' && 'animating'"
             :style="`--offset: ${i}; --color: ${card.player.color}; --top: ${card.top}; --left: ${card.left}`">
          <span class="symbol">{{ card.symbol === 'skull' ? '☠' : '🌺' }}</span>
        </div>
      </template>
    </div>

    <div class="controls">
      <template v-if="asyncIndicator.status === 'ready'">
        <p>Kolik listů je ve hře?</p>
        <SelectionBtnGroup :options="skullLite.currentRound.options"
                           @update:model-value="skullLite.checkAnswer($event)"
        />
      </template>
      <p v-if="asyncIndicator.status === 'error'">Tohle zaváhání tě stálo výherní řadu</p>

      <button class="btn" v-if="asyncIndicator.status !== 'ready'"
              @click="() => skullLite.start()"
              :disabled="asyncIndicator.status === 'loading'"
      >{{ asyncIndicator.status === 'error' ? "Začít znovu" : "Začít" }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, watch} from "vue"
import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import SelectionBtnGroup from "@src/modules/Typeful/inputs/components/SelectionBtnGroup.vue"
import {resolveAfter} from "@src/utils/promiseUtils"

export default defineComponent({
  components: {SelectionBtnGroup},
  setup(props, {emit}) {
    const asyncIndicator = useAsyncIndicator('uninitialized')

    const skullLite = reactive({
      maxRounds: 3,
      players: [
        {color: 'red'},
        {color: 'purple'},
        {color: 'green'},
        {color: 'teal'},
      ],
      currentRound: reactive({
        num: 0,
        cards: [],
        options: [],
      }),

      start() {
        skullLite.beginRound(1)
      },
      beginRound(roundNum: number) {
        skullLite.currentRound.num = roundNum
        skullLite.currentRound.cards.splice(0)

        const cardCount = 3 + (roundNum) * 2
        const skullsByPlayers: Record<string, boolean> = {}

        for (let i = 0; i < cardCount; i++) {
          const iPlayer = (roundNum + i) % skullLite.players.length
          const player = skullLite.players[iPlayer]

          const symbol = !skullsByPlayers[player.color] && Math.random() < 0.2
              ? 'skull' : 'leaf'
          if (symbol === 'skull') {
            skullsByPlayers[player.color] = true
          }

          skullLite.currentRound.cards.push({
            player, symbol,
            top: Math.random(), left: Math.random(),
          })
        }
        skullLite.currentRound.options = Array.from({length: cardCount})
            .map((val, i) => ({value: i + 1, label: i + 1}))
        asyncIndicator.awaitTask(resolveAfter(cardCount * 500))

      },
      checkAnswer(answer: number) {
        const leafCount = skullLite.currentRound.cards
          .reduce((sum, card) => sum += card.symbol === 'leaf' ? 1 : 0, 0)

        if (answer !== leafCount) {
          asyncIndicator.status = 'error'
          return
        }

        if (skullLite.currentRound.num === skullLite.maxRounds) {
          emit('check-solution', skullLite.currentRound.num)
          return
        }
        skullLite.beginRound(skullLite.currentRound.num + 1)
      },
    })

    watch(() => skullLite.currentRound.num, (currentRoundNum) => {
      console.log({currentRoundNum})
    }, {immediate: true})

    return {
      asyncIndicator,

      skullLite,
    }
  },
})
</script>

<style lang="scss">
.mg-skull-lite {
  --card-size: 8rem;

  .card-area {
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4rem;
  }

  .card {
    position: absolute;
    top: calc((100% - var(--card-size)) * var(--top));
    left: calc((100% - var(--card-size)) * var(--left));

    display: grid;
    place-content: center;
    font-size: 4rem;
    width: var(--card-size);
    height: var(--card-size);

    border: 4px solid var(--color);
    border-radius: var(--card-size);
    background-color: beige;

    opacity: 0;
    transform-origin: center;

    &.animating {
      animation: card-flash 0.5s;
      animation-delay: calc(var(--offset, 0) * 0.5s);
    }
  }

  .controls {
    display: flex; flex-direction: column;
    align-items: center;
  }
}

@keyframes card-flash {
  0% {
    opacity: 0;
    transform: rotate(-10deg) scale(1.4);
  }
  20% {
    opacity: 1;
    transform: rotate(0) scale(1.0);
  }
  50% {
    transform: rotate(-5deg);
  }

  100% {
    opacity: 0;
    transform: scale(0.75) rotate(45deg);
  }

}
</style>
