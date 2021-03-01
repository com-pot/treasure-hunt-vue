<template>
  <div :class="['mg-rings', debug && 'debug']">
    <canvas ref="dominoCanvas" class="circular-domino"
            @mousedown="(e) => boardDragStart(e.offsetX, e.offsetY)"
            @mousemove="(e) => boardDragMove(e.offsetX, e.offsetY)"
            @mouseup="boardDragEnd"
    />
    <div class="debug-view" v-if="debug">
      Debug yo
      <ul v-if="draggedRing.iRing !== -1">
        <li>Ring: {{ rings[draggedRing.iRing].rotation.toFixed(2) }} /
          {{ rings[draggedRing.iRing].rotationVelocity.toFixed(2) }}
        </li>
        <li>Offset: {{ draggedRing.holdOffset.angle.toFixed(2) }}</li>
        <li>Current: {{ draggedRing.currentPosition.angle.toFixed(2) }}</li>
      </ul>
    </div>
  </div>

</template>

<script lang="ts">

import {defineComponent} from "vue";

import trigonometry, {Radians, Point2D, PointRad2D} from "@/utils/trigonometry";
import velocityUtils from "@/utils/velocityUtils";
import * as touchUtils from "@/utils/touchUtils"

import * as Model from "./Model/CircularDominoModel";
import CircularDominoApi from "./CircularDominoApi";

type RingPlacement = {
  ring: Model.Ring,
  rotation: Radians,
  rotationVelocity: Radians,
}

type RingDimensions = {
  innerRadius: number,
  radius: number,
  outerRadius: number,
  tileWidth: Radians,
}

const pi2 = Math.PI * 2;

function normalizeAngle(angle: Radians): Radians {
  if (angle > pi2) {
    return angle - pi2;
  }
  if (angle < 0) {
    return angle + pi2;
  }

  return angle;
}


export default defineComponent({
  props: {
    renderSize: {
      type: Number,
      default: 420,
    },
  },
  data() {
    return {
      debug: false,
      rings: [] as RingPlacement[],
      dimensions: {
        innerRadius: 70,
        ringHeightRampStart: 35,
        ringHeightRampTrend: -2,
      },

      dominoCircle: {radius: 420 / 2 - 80},
      selectedPiece: {
        iRing: -1,
        iStone: -1,
      },
      draggedRing: {
        iRing: -1,
        holdOffset: null as PointRad2D | null,
        currentPosition: null as PointRad2D | null,
      },

      redrawInterval: null as number | null,
      animationFrameRequest: 0,
    };
  },
  computed: {
    circleCenter(): Point2D {
      return {x: this.renderSize / 2, y: this.renderSize / 2};
    },
    ringTileCounts(): number[] {
      return this.rings.map((ring) => {
        let tiles = 0;
        for (const stone of ring.ring.stones) {
          tiles += stone.tiles.length;
        }
        return tiles;
      })
    },
    ringsDimensions(): RingDimensions[] {
      let innerRadius = this.dimensions.innerRadius;

      let ringsDimensions: RingDimensions[] = [];
      for (let iRing = 0; iRing < this.ringTileCounts.length; iRing++) {
        let tileWidth = Math.PI * 2 / this.ringTileCounts[iRing];
        let ringHeight = this.dimensions.ringHeightRampStart + iRing * this.dimensions.ringHeightRampTrend;
        ringsDimensions.push({
          tileWidth,
          radius: innerRadius + ringHeight / 2,
          innerRadius,
          outerRadius: innerRadius + ringHeight,
        });
        innerRadius += ringHeight;
      }

      return ringsDimensions;
    },
  },
  methods: {
    // Accessors
    canvas(): HTMLCanvasElement {
      return this.$refs.dominoCanvas as HTMLCanvasElement;
    },
    circuitPosition(angle: Radians, radius: number): Point2D {
      return trigonometry.circuitPosition(angle, radius, this.circleCenter.x, this.circleCenter.y);
    },
    angularPosition(x: number, y: number): PointRad2D {
      return trigonometry.angularPosition(x, y, this.circleCenter.x, this.circleCenter.y);
    },
    getRingIndex(pos: PointRad2D): number {
      for (let iRing = 0; iRing < this.rings.length; iRing++) {
        let ring = this.ringsDimensions[iRing];

        if (ring.innerRadius < pos.radius && pos.radius < ring.outerRadius) {
          return iRing;
        }
      }

      return -1;
    },

    // Computation
    getStoneTileWidth(iRing: number, iStone: number): number {
      const ring = this.rings[iRing];
      if (!ring) {
        console.warn("No ring with offset", iRing);
        return 0;
      }

      let stone = ring.ring.stones[iStone];
      if (!stone) {
        console.warn(`Ring ${iRing} does not have stone ${iStone}`);
        return 0;
      }

      return stone.tiles.length;
    },

    // Controls
    boardDragStart(x: number, y: number) {
      let pos = this.angularPosition(x, y);
      let iRing = this.getRingIndex(pos);

      if (iRing !== -1) {
        this.draggedRing.iRing = iRing;
        this.draggedRing.currentPosition = pos;
        this.draggedRing.holdOffset = {
          radius: pos.radius,
          angle: pos.angle - this.rings[iRing].rotation,
        };
      }
    },
    boardDragEnd() {
      if (this.draggedRing.iRing !== -1) {
        this.draggedRing.iRing = -1;
        this.draggedRing.holdOffset = this.draggedRing.currentPosition = null;
      }
    },
    boardDragMove(x: number, y: number) {
      if (this.draggedRing.iRing !== -1) {
        this.draggedRing.currentPosition = this.angularPosition(x, y);
      }
    },
    boardClicked(e: MouseEvent) {
      let pos = this.angularPosition(e.offsetX, e.offsetY);

      let iRing = this.getRingIndex(pos);
      if (iRing !== -1) {
        this.onRingClicked(iRing, pos);
      }
    },
    onRingClicked(iRing: number, pos: PointRad2D) {
      const ring = this.rings[iRing];
      const ringTileWidth = Math.PI * 2 / this.ringTileCounts[iRing];

      let angle = pos.angle - ring.rotation;
      let correction = Math.sign(angle) * Math.floor(angle / pi2);
      angle -= correction * pi2;

      let clickedTile = Math.floor(angle / ringTileWidth);

      console.log({pos, angle, clickedTile});

      let clickedStone = -1;
      let searchedTiles = 0;
      for (let iStone = 0; iStone < ring.ring.stones.length; iStone++) {
        const stoneTiles = this.getStoneTileWidth(iRing, iStone);
        if (searchedTiles <= clickedTile && clickedTile < searchedTiles + stoneTiles) {
          clickedStone = iStone;
          break;
        }
        searchedTiles += stoneTiles;
      }

      if (clickedStone !== -1) {
        this.onStoneClicked(iRing, clickedStone);
      }
    },
    onStoneClicked(iRing: number, iStone: number) {
      if (iRing === this.selectedPiece.iRing && iStone === this.selectedPiece.iStone) {
        this.selectedPiece.iRing = this.selectedPiece.iStone = -1;
        return;
      }

      if (this.selectedPiece.iRing === -1 && this.selectedPiece.iStone === -1) {
        this.selectedPiece.iRing = iRing;
        this.selectedPiece.iStone = iStone;
        return;
      }

      let selectedPiece = this.rings[this.selectedPiece.iRing].ring.stones[this.selectedPiece.iStone];
      this.rings[this.selectedPiece.iRing].ring.stones[this.selectedPiece.iStone] = this.rings[iRing].ring.stones[iStone];
      this.rings[iRing].ring.stones[iStone] = selectedPiece;

      this.selectedPiece.iRing = this.selectedPiece.iStone = -1;
    },

    // Updating
    tick() {
      this.updateRings();
      this.triggerRedraw();
    },
    updateRings() {
      for (let iRing = 0; iRing < this.rings.length; iRing++) {
        const ring = this.rings[iRing];

        ring.rotation = normalizeAngle(ring.rotation + ring.rotationVelocity);
        let momentum = 0.8 + iRing * 0.05;

        let newVelocity: number;
        if (iRing === this.draggedRing.iRing && this.draggedRing.currentPosition && this.draggedRing.holdOffset) {
          let currentPosition = this.draggedRing.currentPosition.angle - this.draggedRing.holdOffset.angle;
          let targetVelocity = velocityUtils.angleToVelocity(currentPosition - ring.rotation);

          newVelocity = velocityUtils.interpolateVelocity(ring.rotationVelocity, targetVelocity, momentum);
        } else {
          newVelocity = velocityUtils.interpolateVelocity(ring.rotationVelocity, 0, momentum);
        }

        ring.rotationVelocity = Math.abs(newVelocity) < 0.005 ? 0 : newVelocity;
      }
    },

    // Rendering
    triggerRedraw() {
      if (this.animationFrameRequest) {
        console.log("Tick not rendered");
        return;
      }

      this.animationFrameRequest = window.requestAnimationFrame(() => {
        this.renderScene();
        this.animationFrameRequest = 0;
      });
    },
    renderScene() {
      let canvas = this.canvas();
      if (!canvas) {
        console.warn("No canvas initialized");
        return;
      }
      let g = canvas.getContext("2d")!;
      if (!g) {
        console.warn("Could not get graphics context");
        return;
      }
      g.clearRect(0, 0, this.renderSize, this.renderSize);

      for (let iRing = 0; iRing < this.rings.length; iRing++) {
        this.renderRing(g, iRing);
      }
    },
    renderRing(g: CanvasRenderingContext2D, iRing: number) {
      let ring = this.rings[iRing];
      let ringDimensions: RingDimensions = this.ringsDimensions[iRing];

      let renderedTiles = 0;
      for (let iStone = 0; iStone < ring.ring.stones.length; iStone++) {
        let stone = ring.ring.stones[iStone];
        let stoneTileStart = renderedTiles;

        let highlight = iRing === this.selectedPiece.iRing && iStone === this.selectedPiece.iStone;
        for (let iTile = 0; iTile < stone.tiles.length; iTile++) {
          this.renderTile(g, stone.tiles[iTile], ring.rotation + renderedTiles * ringDimensions.tileWidth, ringDimensions, highlight);
          renderedTiles++;
        }

        let stoneAngleStart = ring.rotation + stoneTileStart * ringDimensions.tileWidth;
        let stoneWidth = stone.tiles.length * ringDimensions.tileWidth;
        g.strokeStyle = highlight ? "white" : "black";
        g.lineWidth = 2;
        this.pathBlock(g, ringDimensions.outerRadius, ringDimensions.innerRadius, stoneAngleStart, stoneAngleStart + stoneWidth);
        g.stroke();
      }
    },
    renderTile(g: CanvasRenderingContext2D, tile: Model.Tile, angle: Radians, dimensions: RingDimensions, highlight: boolean) {
      this.pathBlock(g, dimensions.outerRadius, dimensions.innerRadius, angle, angle + dimensions.tileWidth);
      g.fillStyle = tile.bgColor;
      g.fill();

      this.renderPieceText(g, tile, angle, dimensions, highlight);
    },
    renderPieceText(g: CanvasRenderingContext2D, piece: Model.Tile, angle: Radians, dimensions: RingDimensions, highlight: boolean) {
      g.strokeStyle = highlight ? 'white' : 'black';

      let textAngle = angle + dimensions.tileWidth * 0.5;
      let p = this.circuitPosition(textAngle, dimensions.radius)
      g.translate(p.x, p.y);
      g.rotate(textAngle + Math.PI / 2);
      g.strokeText(piece.symbol, 0, 0);
      g.resetTransform();

      /* Debug angle text
      let p = this.circuitPosition(angle, this.dominoCircle.radius);
      g.strokeText('' + angle.toFixed(1), p.x, p.y);
      let pRad = this.angularPosition(p.x, p.y);

      p = this.circuitPosition(angle, this.dominoCircle.radius + 20);
      g.strokeText('' + pRad.angle.toFixed(1), p.x, p.y);
      */
    },
    pathBlock(g: CanvasRenderingContext2D, rOut: number, rIn: number, radA: Radians, radB: Radians) {
      let beginning;
      let p = beginning = this.circuitPosition(radA, rOut);
      g.moveTo(p.x, p.y);
      g.beginPath();

      g.arc(this.circleCenter.x, this.circleCenter.y, rOut, radA, radB, radA > radB);

      p = this.circuitPosition(radB, rIn);
      g.lineTo(p.x, p.y);

      p = this.circuitPosition(radA, rIn);
      g.arc(this.circleCenter.x, this.circleCenter.y, rIn, radB, radA, radA < radB);
      g.lineTo(beginning.x, beginning.y);

      g.closePath();
    },
  },
  created() {
    CircularDominoApi.loadRings().then((rings) => {
      this.rings = rings
          .map((ring) => {
            let speed = (0.05 + Math.random() * 0.05) * Math.PI;
            let direction = Math.sign(Math.random() - 0.5) * 2;
            return ({rotation: 0, rotationVelocity: direction * speed, ring});
          });
    });
  },
  mounted() {
    let c: HTMLCanvasElement = this.canvas();
    c.width = this.renderSize;
    c.height = this.renderSize;

    this.redrawInterval = setInterval(() => this.tick(), 25);

    c.addEventListener('touchstart', (e) => {
      let p = touchUtils.getOffsetPosition(e);
      e.preventDefault();
      this.boardDragStart(p.offsetX, p.offsetY);
    });

    c.addEventListener('touchmove', (e) => {
      let p = touchUtils.getOffsetPosition(e);
      e.preventDefault();
      this.boardDragMove(p.offsetX, p.offsetY);
    });

    c.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.boardDragEnd();
    });
  },
  beforeUnmount() {
    if (this.redrawInterval) {
      clearInterval(this.redrawInterval);
    }
  }
})
</script>

<style lang="scss">
.mg-rings {

  .circular-domino {
    border: 1px solid black;
    background: white;
  }

  &.debug {
    display: flex;
    flex-direction: column;

    .circular-domino {
      flex: 1
    }

    .debug-view {
      width: 160px;
    }
  }
}

</style>
