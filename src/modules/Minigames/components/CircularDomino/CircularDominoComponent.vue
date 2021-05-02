<template>
  <div :class="['mg-rings', ui.debug && 'debug']">
    <canvas ref="canvas" class="circular-domino"
            @mousedown="(e) => board.drag.start(e.offsetX, e.offsetY)"
            @mousemove="(e) => board.drag.move(e.offsetX, e.offsetY)"
            @mouseup="() => board.drag.end()"
    />

    <MinigameControls :check-solution="checkSolution"/>
    <div class="debug-view" v-if="ui.debug">
      Debug yo
      <ul v-if="board.drag.iRing !== -1">
        <li>Ring: {{ minigameState.value.ringsAngles[board.drag.iRing].toFixed(2) }} /
          {{ ui.ringAngularVelocity[board.drag.iRing].toFixed(2) }}
        </li>
        <li>Offset: {{ board.drag.holdOffset.angle.toFixed(2) }}</li>
        <li>Current: {{ board.drag.currentPosition.angle.toFixed(2) }}</li>
      </ul>
    </div>
  </div>

</template>

<script lang="ts">

import {defineComponent, onBeforeUnmount, onMounted, reactive, ref} from "vue"

import * as touchUtils from "@/utils/touchUtils"

import * as Model from "./Model/CircularDominoModel"

import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"
import {useGameLoop} from "../../utils/gameLoop"
import {UiConfig, useAngularBoard} from "@/modules/Minigames/components/CircularDomino/angularBoard"
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue";
import {hashCode} from "@/utils/stringUtils";
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils";


export default defineComponent({
  components: {MinigameControls},
  props: {
    renderSize: {
      type: Number,
      default: 420,
    },
  },
  setup(props) {
    const minigameData = useViewData<Model.CircularDominoData>()
    const minigameState = useViewState<Model.CircularDominoState>(() => ({
      ringsAngles: minigameData.value.rings.map(() => 0),
    }))
    const controls = useMinigameControls()

    const minigameDataReactive = reactive(minigameData.value)
    const minigameStateReactive = reactive(minigameState.value)

    const ui = reactive<UiConfig>({
      debug: false,
      dominoCircle: {radius: 420 / 2 - 80},
      renderSize: props.renderSize,
      clientSize: props.renderSize,

      dimensions: {
        ringHeightRampStart: 50,
        ringHeightRampTrend: -6,
      },
      ringAngularVelocity: minigameData.value.rings.map(() => 0),
    })

    const canvas = ref<HTMLCanvasElement | null>(null)

    const board = useAngularBoard(minigameDataReactive, minigameStateReactive, ui)
    const gameLoop = useGameLoop(board.update, board.draw.frame, 60)

    const updateClientSize = () => {
      ui.clientSize = canvas.value!.clientWidth
    }

    onMounted(() => {
      // let speed = (0.05 + Math.random() * 0.05) * Math.PI
      // let direction = Math.sign(Math.random() - 0.5) * 2
      // return ({rotation: 0, rotationVelocity: direction * speed, ring})

      let c = canvas.value!
      c.width = ui.renderSize
      c.height = ui.renderSize
      gameLoop.g = c.getContext('2d')

      gameLoop.start()

      c.addEventListener('touchstart', (e) => {
        let p = touchUtils.getOffsetPosition(e)
        e.preventDefault()
        board.drag.start(p.offsetX, p.offsetY)
      })

      c.addEventListener('touchmove', (e) => {
        let p = touchUtils.getOffsetPosition(e)
        e.preventDefault()
        board.drag.move(p.offsetX, p.offsetY)
      })

      c.addEventListener('touchend', (e) => {
        e.preventDefault()
        board.drag.end()
      })

      window.addEventListener('resize', updateClientSize)
      updateClientSize()
    })

    onBeforeUnmount(() => {
      gameLoop.stop()
      window.removeEventListener('resize', updateClientSize)
    })

    return {
      minigameData,
      minigameState,

      ui,
      board,
      gameLoop,

      canvas,

      checkSolution() {
        let snapStones = board.ringsSnaps
            .map(({snapIndex}, i) => minigameData.value.rings[i].stones[snapIndex].tiles[0])
            .map((tile) => tile.bgColor + '-' + tile.symbol)
            .join('--')

        controls.checkSolution(hashCode(snapStones))
      },
    }
  },
})
</script>

<style lang="scss">
.mg-rings {
  display: flex;
  flex-direction: column;

  .circular-domino {
    flex: 1;
  }

  &.debug {
    .debug-view {
      width: 160px;
    }
  }
}

</style>
