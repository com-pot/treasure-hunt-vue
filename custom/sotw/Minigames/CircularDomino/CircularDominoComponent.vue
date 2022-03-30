<template>
  <div :class="['mg-rings', ui.debug && 'debug']">
    <canvas ref="canvas" class="layer-bg"/>
    <canvas ref="canvasFg" class="layer-fg"/>

    <div class="debug-view" v-if="ui.debug">
      Debug yo
      <ul v-if="board.drag.iRing !== -1">
        <li>Ring: {{ minigameState.value.ringsAngles[board.drag.iRing].toFixed(2) }} /
          {{ ui.ringAngularVelocity[board.drag.iRing].toFixed(2) }}
        </li>
        <li>Offset: {{ board?.drag?.holdOffset?.angle.toFixed(2) }}</li>
        <li>Current: {{ board?.drag?.currentPosition?.angle.toFixed(2) }}</li>
      </ul>
    </div>
  </div>

</template>

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref} from "vue"
import {useRoute} from "vue-router"

import * as touchUtils from "@src/utils/touchUtils"

import * as Model from "./Model/CircularDominoModel"

import {useMinigameData, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import {useGameLoop} from "@src/modules/treasure-hunt/components/gameLoop"
import {UiConfig, useAngularBoard} from "./angularBoard"
import {useMinigameControls} from "@src/modules/treasure-hunt/components/minigameData"



export default defineComponent({
  props: {
    renderSize: {
      type: Number,
      default: 420,
    },
  },
  setup(props) {
    const route = useRoute()
    const minigameData = useMinigameData<Model.CircularDominoData>()
    const minigameState = useViewState<Model.CircularDominoState>(() => ({
      ringsAngles: minigameData.value.rings.map(() => 0),
    }))
    useMinigameControls({
      getValue: () => solution.value,
      reset: () => {
        minigameState.reset(minigameData.value)
        Object.assign(minigameStateReactive, minigameState.value)
      },
    })

    const minigameDataReactive = reactive(minigameData.value)
    const minigameStateReactive = reactive(minigameState.value)

    const ui = reactive<UiConfig>({
      debug: false,
      dominoCircle: {radius: props.renderSize / 2 - 80},
      renderSize: props.renderSize,
      clientSize: props.renderSize,

      dimensions: {
        ringHeightRampStart: 50,
        ringHeightRampTrend: -6,
      },
      ringAngularVelocity: minigameData.value.rings.map(() => 0),

      resources: {
        ringBg: "/minigames/circular/wood.jpg",
        turkey2: '/minigames/circular/turkey2.png',
        sun: '/minigames/circular/sun.png',
        goat: '/minigames/circular/goat.png',
        shaman: '/minigames/circular/shaman.png',
        turtle: '/minigames/circular/turtle.png',
        turkey: '/minigames/circular/turkey.png',
        kakadu: '/minigames/circular/kakadu.png',
        bird: '/minigames/circular/bird.png',
        crow: '/minigames/circular/crow.png',
        swallow: '/minigames/circular/swallow.png',
        kakadu2: '/minigames/circular/kakadu2.png',
        moose: '/minigames/circular/moose.png',
        tongue: '/minigames/circular/tongue.png',
      },
    })

    const canvas = ref<HTMLCanvasElement | null>(null)
    const canvasFg = ref<HTMLCanvasElement | null>(null)

    const board = useAngularBoard(minigameDataReactive, minigameStateReactive, ui)
    const fps = route.query.fps ? Number(route.query.fps) : 60
    const render = () => {
      if (!g) {
        console.warn("Could not get graphics context")
      } else {
        board.draw.frame(g)
      }
    }
    const gameLoop = useGameLoop(fps, board.update, render)

    const updateClientSize = () => {
      ui.clientSize = canvas.value!.clientWidth
    }
    const onVisibleChanged: EventListener = () => {
      if (!document.hidden) {
        gameLoop.start()
      } else {
        gameLoop.stop()
      }
    }

    const bindCanvasControls = (canvas: HTMLCanvasElement) => {
      canvas.addEventListener('touchstart', (e) => {
        let p = touchUtils.getOffsetPosition(e)
        e.preventDefault()
        board.drag.start(p.offsetX, p.offsetY)
      })

      canvas.addEventListener('touchmove', (e) => {
        let p = touchUtils.getOffsetPosition(e)
        e.preventDefault()
        board.drag.move(p.offsetX, p.offsetY)
      })

      canvas.addEventListener('touchend', (e) => {
        e.preventDefault()
        board.drag.end()
      })
      canvas.addEventListener("mousedown", (e) => {
        e.preventDefault()
        board.drag.start(e.offsetX, e.offsetY);
      })
      canvas.addEventListener("mousemove", (e) => {
        e.preventDefault()
        board.drag.move(e.offsetX, e.offsetY)
      })
      canvas.addEventListener("mouseup", () => board.drag.end())
    }

    const solution = computed(() => board.ringsSnaps
        .map(({snapIndex}, i) => minigameData.value.rings[i].stones[snapIndex].tiles[0])
        .map((tile) => tile.bgColor + '-' + tile.symbol)
        .join('--'))

    let g: [CanvasRenderingContext2D, CanvasRenderingContext2D]
    onMounted(() => {
      // let speed = (0.05 + Math.random() * 0.05) * Math.PI
      // let direction = Math.sign(Math.random() - 0.5) * 2
      // return ({rotation: 0, rotationVelocity: direction * speed, ring})

      const cBg = canvas.value!
      const cFg = canvasFg.value!
      cFg.width = cBg.width = ui.renderSize
      cFg.height = cBg.height = ui.renderSize

      g = [cBg.getContext('2d')!, cFg.getContext('2d')!]

      board.resources.whenReady()
          .then(() => gameLoop.start())

      bindCanvasControls(cFg)

      window.addEventListener('resize', updateClientSize)
      document.addEventListener("visibilitychange", onVisibleChanged)
      updateClientSize()
    })

    onBeforeUnmount(() => {
      gameLoop.stop()
      window.removeEventListener('resize', updateClientSize)
      document.removeEventListener("visibilitychange", onVisibleChanged)
    })

    return {
      minigameData,
      minigameState,

      ui,
      board,
      gameLoop,

      canvas,
      canvasFg,
    }
  },
})
</script>

<style lang="scss">
.mg-rings {
  display: grid;
  flex-direction: column;

  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas: "canvas";

  canvas {
    grid-area: canvas;
    width: 100%;
  }


  &.debug {
    .debug-view {
      width: 160px;
    }
  }
}

</style>
