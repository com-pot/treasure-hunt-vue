<template>
  <canvas ref="dominoCanvas" class="circular-domino" @click="boardClicked"/>
</template>

<script lang="ts">

import {defineComponent} from "vue";

import {Radians, Point2D, PointRad2D} from "@/types/graphics";

import {degToRad} from "@/types/graphics";
import CircularDominoPiece from "./Model/CircularDominoPiece";
import CircularDominoApi from "@/minigames/CircularDomino/CircularDominoApi";
import trigonometry from "@/utils/trigonometry";

export default defineComponent({
  props: {
    renderSize: {
      type: Number,
      default: 420,
    },
    piecesCount: {
      type: Number,
      default: 8,
    },
    pieceHeight: {
      type: Number,
      default: 36,
    },
  },
  data() {
    return {
      pieces: [] as CircularDominoPiece[],
      dominoCircle: {radius: 420 / 2 - 80},
      heldPieceIndex: -1 as number,
      boardRotation: 0 as Radians,
      redrawInterval: null as number | null,
    };
  },
  computed: {
    pieceWidth(): Radians {
      return Math.PI * 2 / this.piecesCount;
    },
    circleCenter(): Point2D {
      return {x: this.renderSize / 2, y: this.renderSize / 2};
    }
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

    // Controls
    boardClicked(e: MouseEvent) {
      let pos = this.angularPosition(e.offsetX, e.offsetY);
      pos.angle -= this.boardRotation;
      if (pos.angle < 0) {
        pos.angle += Math.PI * 2;
      }

      let outerRadius = this.dominoCircle.radius + this.pieceHeight / 2;
      let innerRadius = this.dominoCircle.radius - this.pieceHeight / 2;

      let clickedPiece = -1;
      for (let i = 0; i < this.piecesCount; i++) {
        if (pos.radius < innerRadius || pos.radius > outerRadius) {
          break
        }

        let minAngle = i * this.pieceWidth;
        let maxAngle = (i + 1) * this.pieceWidth;

        if (pos.angle < minAngle || pos.angle > maxAngle) {
          console.log("Bad angle", i, {
            angle: pos.angle.toFixed(2),
            minAngle: minAngle.toFixed(2),
            maxAngle: maxAngle.toFixed(2),
          });
          continue;
        }
        clickedPiece = i;
        break;
      }
      if (clickedPiece !== -1) {
        this.onPieceSlotClicked(clickedPiece);
      }
    },
    onPieceSlotClicked(clickedSlot: number) {
      if (clickedSlot === this.heldPieceIndex) {
        this.heldPieceIndex = -1;
        return;
      }
      if (this.heldPieceIndex === -1 && this.pieces[clickedSlot]) {
        this.heldPieceIndex = clickedSlot;
        return;
      }

      let piece = this.pieces[this.heldPieceIndex];
      this.pieces[this.heldPieceIndex] = this.pieces[clickedSlot];
      this.pieces[clickedSlot] = piece;
      this.heldPieceIndex = -1;
    },
    // Rendering
    renderPuzzle() {
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
      for (let i = 0; i < this.piecesCount; i++) {
        let piece = this.pieces[i];
        if (!piece) {
          continue;
        }

        let highlight = i === this.heldPieceIndex;
        this.renderPiece(g, piece, (i) * this.pieceWidth + this.boardRotation, highlight);
      }
    },
    renderPiece(g: CanvasRenderingContext2D, piece: CircularDominoPiece, rotation: Radians, highlight: boolean) {
      if (rotation > Math.PI * 2) {
        rotation -= Math.PI * 2;
      }
      this.renderPieceBackground(g, piece, rotation, highlight);
      this.renderPieceText(g, piece, rotation, highlight);
    },
    renderPieceBackground(g: CanvasRenderingContext2D, piece: CircularDominoPiece, angle: Radians, highlight: boolean) {
      let outerRadius = this.dominoCircle.radius + this.pieceHeight / 2;
      let innerRadius = this.dominoCircle.radius - this.pieceHeight / 2;
      let widthHalf = this.pieceWidth / 2;

      this.pathBlock(g, outerRadius, innerRadius, angle, angle + widthHalf);
      g.fillStyle = piece.lCol;
      g.fill();
      this.pathBlock(g, outerRadius, innerRadius, angle + widthHalf, angle + this.pieceWidth)
      g.fillStyle = piece.rCol;
      g.fill();

      if (highlight) {
        g.strokeStyle = "white";
        g.lineWidth = 2;
        this.pathBlock(g, outerRadius, innerRadius, angle, angle + this.pieceWidth)
        g.stroke();
      }
    },
    renderPieceText(g: CanvasRenderingContext2D, piece: CircularDominoPiece, angle: Radians, highlight: boolean) {
      g.strokeStyle = highlight ? 'white' : 'black';

      let textAngle = angle + this.pieceWidth * 0.25;
      let p = this.circuitPosition(textAngle, this.dominoCircle.radius)
      g.translate(p.x, p.y);
      g.rotate(textAngle + Math.PI / 2);
      g.strokeText(piece.lImg, 0, 0);
      g.resetTransform();

      textAngle = angle + this.pieceWidth * 0.75;
      p = this.circuitPosition(textAngle, this.dominoCircle.radius);
      g.translate(p.x, p.y);
      g.rotate(textAngle + Math.PI / 2);
      g.strokeText(piece.rImg, 0, 0);
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
    }
  },
  created() {
    CircularDominoApi.loadPieces().then((pieces) => {
      this.pieces = pieces.slice();
      this.renderPuzzle();
    });
  },
  mounted() {
    let c = this.canvas();
    c.width = this.renderSize;
    c.height = this.renderSize;
    this.renderPuzzle();

    let rotationIncrement = degToRad(0.5);
    let pi2 = Math.PI * 2;
    this.redrawInterval = setInterval(() => {
      this.boardRotation += rotationIncrement;
      if (this.boardRotation > pi2) {
        this.boardRotation -= pi2;
      }
      this.renderPuzzle();
    }, 25);
  },
  beforeUnmount() {
    if (this.redrawInterval) {
      clearInterval(this.redrawInterval);
    }
  }
})
</script>

<style lang="scss">
.circular-domino {
  border: 1px solid black;
}
</style>
