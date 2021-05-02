import {computed, reactive, watch} from "vue"

import trigonometry, {Degrees, Point2D, PointRad2D, Radians} from "@/utils/trigonometry"
import * as Model from "./Model/CircularDominoModel"
import velocityUtils from "@/utils/velocityUtils"
import {minIndexBy} from "@/utils/arrays";

export type UiConfig = {
    debug: boolean,
    dominoCircle: { radius: number },

    renderSize: number,
    clientSize: number,

    dimensions: {
        innerRadius: number,
        ringHeightRampStart: number,
        ringHeightRampTrend: number,
    },
    ringAngularVelocity: Radians[],
}

type RingDimensions = {
    innerRadius: number,
    radius: number,
    outerRadius: number,
    tileWidth: Radians,
}

const pi2 = Math.PI * 2

function normalizeAngle(angle: Radians): Radians {
    if (angle > pi2) {
        return angle - pi2
    }
    if (angle < 0) {
        return angle + pi2
    }

    return angle
}


export function useAngularBoard(minigameData: Model.CircularDominoData, state: Model.CircularDominoState, ui: UiConfig) {
    const ringTileCounts = computed(() => minigameData.rings.map((ring) => {
        let tiles = 0
        for (const stone of ring.stones) {
            tiles += stone.tiles.length
        }
        return tiles
    }))
    const ringsDimensions = computed<RingDimensions[]>(() => {
        let innerRadius = ui.dimensions.innerRadius

        let ringsDimensions: RingDimensions[] = []
        for (let iRing = 0; iRing < ringTileCounts.value.length; iRing++) {
            let tileWidth = pi2 / ringTileCounts.value[iRing]
            let ringHeight = ui.dimensions.ringHeightRampStart + iRing * ui.dimensions.ringHeightRampTrend
            ringsDimensions.push({
                tileWidth,
                radius: innerRadius + ringHeight / 2,
                innerRadius,
                outerRadius: innerRadius + ringHeight,
            })
            innerRadius += ringHeight
        }

        return ringsDimensions
    })
    const renderScale = computed(() => ui.renderSize / ui.clientSize)
    const speedLimit = Math.PI * 0.75

    const ringsSnapPoints = computed<Degrees[][]>(() => {
        return minigameData.rings.map((ring, iRing) => {
            const snapPoints: Radians[] = []
            let stoneOffset = 0
            ring.stones.forEach((stone) => {
                const stoneWidth = stone.tiles.length * ringsDimensions.value[iRing].tileWidth
                snapPoints.push(stoneOffset + stoneWidth * 0.5)
                stoneOffset += stoneWidth
            })
            return snapPoints
        })
    })

    const ringsSnaps = computed(() => {
        return minigameData.rings.map((_, i) => {
            const angleTarget = Math.PI * -0.5 - state.ringsAngles[i]
            const ringSnapPoints = ringsSnapPoints.value[i]

            let snapIndex = 0
            let snapAngleDiff = Math.abs(trigonometry.minAngleDiff(angleTarget, ringSnapPoints[0]))
            for (let iSnap = 1; iSnap < ringSnapPoints.length; iSnap++) {
                const diff = Math.abs(trigonometry.minAngleDiff(angleTarget, ringSnapPoints[iSnap]))
                if (diff < snapAngleDiff) {
                    snapIndex = iSnap
                    snapAngleDiff = diff
                }
            }

            return {snapIndex, snapAngle: normalizeAngle(Math.PI * -0.5 - ringSnapPoints[snapIndex])}
        })
    })

    const updateRings = (t: number, dt: number): boolean => {
        const speedLimitCurrent = dt * 0.001 * speedLimit
        let updated = false

        for (let iRing = 0; iRing < minigameData.rings.length; iRing++) {
            const ringIsDragged = iRing === drag.iRing && drag.currentPosition && drag.holdOffset
            const targetAngle = ringIsDragged
                ? drag.currentPosition!.angle - drag.holdOffset!.angle
                : ringsSnaps.value[iRing].snapAngle

            const speedLimitRing = speedLimitCurrent - iRing * 0.01
            ui.ringAngularVelocity[iRing] = velocityUtils.angleToVelocity(targetAngle - state.ringsAngles[iRing], speedLimitRing)
            if (ui.ringAngularVelocity[iRing] === 0) {
                continue
            }
            state.ringsAngles[iRing] = normalizeAngle(state.ringsAngles[iRing] + ui.ringAngularVelocity[iRing])
            updated = true
        }

        return updated
    }

    /*const select = reactive({
        iRing: -1,
        iStone: -1,

        boardClicked(e: MouseEvent) {
            let pos = this.angularPosition(e.offsetX, e.offsetY)

            let iRing = this.getRingIndex(pos)
            if (iRing !== -1) {
                this.onRingClicked(iRing, pos)
            }
        },
        onRingClicked(iRing: number, pos: PointRad2D) {
            const ring = this.rings[iRing]
            const ringTileWidth = Math.PI * 2 / this.ringTileCounts[iRing]

            let angle = pos.angle - ring.rotation
            let correction = Math.sign(angle) * Math.floor(angle / pi2)
            angle -= correction * pi2

            let clickedTile = Math.floor(angle / ringTileWidth)

            console.log({pos, angle, clickedTile})

            let clickedStone = -1
            let searchedTiles = 0
            for (let iStone = 0 iStone < ring.ring.stones.length iStone++) {
                const stoneTiles = this.getStoneTileWidth(iRing, iStone)
                if (searchedTiles <= clickedTile && clickedTile < searchedTiles + stoneTiles) {
                    clickedStone = iStone
                    break
                }
                searchedTiles += stoneTiles
            }

            if (clickedStone !== -1) {
                this.onStoneClicked(iRing, clickedStone)
            }
        },
        onStoneClicked(iRing: number, iStone: number) {
            if (iRing === this.selectedPiece.iRing && iStone === this.selectedPiece.iStone) {
                this.selectedPiece.iRing = this.selectedPiece.iStone = -1
                return
            }

            if (this.selectedPiece.iRing === -1 && this.selectedPiece.iStone === -1) {
                this.selectedPiece.iRing = iRing
                this.selectedPiece.iStone = iStone
                return
            }

            let selectedPiece = this.rings[this.selectedPiece.iRing].ring.stones[this.selectedPiece.iStone]
            this.rings[this.selectedPiece.iRing].ring.stones[this.selectedPiece.iStone] = this.rings[iRing].ring.stones[iStone]
            this.rings[iRing].ring.stones[iStone] = selectedPiece

            this.selectedPiece.iRing = this.selectedPiece.iStone = -1
        },
    })*/

    const drag = reactive({
        iRing: -1,
        holdOffset: null as PointRad2D | null,
        currentPosition: null as PointRad2D | null,

        start(x: number, y: number) {
            let pos = board.angularPosition(x * renderScale.value, y * renderScale.value)
            let iRing = board.getRingIndex(pos)

            if (iRing !== -1) {
                drag.iRing = iRing
                drag.currentPosition = pos
                drag.holdOffset = {
                    radius: pos.radius,
                    angle: pos.angle - state.ringsAngles[iRing],
                }
            }
        },
        end() {
            if (drag.iRing !== -1) {
                drag.iRing = -1
                drag.holdOffset = drag.currentPosition = null
            }
        },
        move(x: number, y: number) {
            if (drag.iRing !== -1) {
                drag.currentPosition = board.angularPosition(x * renderScale.value, y * renderScale.value)
            }
        },
    })

    const draw = {
        frame(g: CanvasRenderingContext2D) {
            g.clearRect(0, 0, ui.renderSize, ui.renderSize)

            for (let iRing = 0; iRing < minigameData.rings.length; iRing++) {
                draw.renderRing(g, iRing)
            }
        },
        renderRing(g: CanvasRenderingContext2D, iRing: number) {
            let ring = minigameData.rings[iRing]
            let ringDimensions: RingDimensions = ringsDimensions.value[iRing]

            let renderedTiles = 0
            for (let iStone = 0; iStone < ring.stones.length; iStone++) {
                let stone = ring.stones[iStone]
                let stoneTileStart = renderedTiles

                let highlight = ringsSnaps.value[iRing].snapIndex === iStone // iRing === select.selectedPiece.iRing && iStone === this.selectedPiece.iStone
                for (let iTile = 0; iTile < stone.tiles.length; iTile++) {
                    draw.renderTile(g, stone.tiles[iTile], state.ringsAngles[iRing] + renderedTiles * ringDimensions.tileWidth, ringDimensions, highlight)
                    renderedTiles++
                }

                let stoneAngleStart = state.ringsAngles[iRing] + stoneTileStart * ringDimensions.tileWidth
                let stoneWidth = stone.tiles.length * ringDimensions.tileWidth
                g.strokeStyle = highlight ? "white" : "black"
                g.lineWidth = 2
                draw.pathBlock(g, ringDimensions.outerRadius, ringDimensions.innerRadius, stoneAngleStart, stoneAngleStart + stoneWidth)
                g.stroke()
            }
        },
        renderTile(g: CanvasRenderingContext2D, tile: Model.Tile, angle: Radians, dimensions: RingDimensions, highlight: boolean) {
            draw.pathBlock(g, dimensions.outerRadius, dimensions.innerRadius, angle, angle + dimensions.tileWidth)
            g.fillStyle = tile.bgColor
            g.fill()

            draw.renderPieceText(g, tile, angle, dimensions, highlight)
        },
        renderPieceText(g: CanvasRenderingContext2D, piece: Model.Tile, angle: Radians, dimensions: RingDimensions, highlight: boolean) {
            g.strokeStyle = highlight ? 'white' : 'black'

            let textAngle = angle + dimensions.tileWidth * 0.5
            let p = board.circuitPosition(textAngle, dimensions.radius)
            g.translate(p.x, p.y)
            g.rotate(textAngle + Math.PI / 2)
            g.strokeText(piece.symbol, 0, 0)
            g.resetTransform()

            if (ui.debug) {
                let p = board.circuitPosition(angle, ui.dominoCircle.radius)
                g.strokeText('' + angle.toFixed(1), p.x, p.y)
                let pRad = board.angularPosition(p.x, p.y)

                p = board.circuitPosition(angle, ui.dominoCircle.radius + 20)
                g.strokeText('' + pRad.angle.toFixed(1), p.x, p.y)
            }
        },
        pathBlock(g: CanvasRenderingContext2D, rOut: number, rIn: number, radA: Radians, radB: Radians) {
            let beginning
            let p = beginning = board.circuitPosition(radA, rOut)
            g.moveTo(p.x, p.y)
            g.beginPath()

            g.arc(board.center.x, board.center.y, rOut, radA, radB, radA > radB)

            p = board.circuitPosition(radB, rIn)
            g.lineTo(p.x, p.y)

            p = board.circuitPosition(radA, rIn)
            g.arc(board.center.x, board.center.y, rIn, radB, radA, radA < radB)
            g.lineTo(beginning.x, beginning.y)

            g.closePath()
        },
    }

    const board = reactive({
        ringTileCounts,
        ringsSnapPoints,
        ringsSnaps,

        center: computed<Point2D>(() => ({x: ui.renderSize * 0.5, y: ui.renderSize * 0.5})),
        drag,

        update: updateRings,
        draw,

        circuitPosition(angle: Radians, radius: number): Point2D {
            return trigonometry.circuitPosition(angle, radius, board.center.x, board.center.y)
        },
        angularPosition(x: number, y: number): PointRad2D {
            return trigonometry.angularPosition(x, y, board.center.x, board.center.y)
        },
        getRingIndex(pos: PointRad2D): number {
            for (let iRing = 0; iRing < minigameData.rings.length; iRing++) {
                let ring = ringsDimensions.value[iRing]

                if (ring.innerRadius < pos.radius && pos.radius < ring.outerRadius) {
                    return iRing
                }
            }

            return -1
        },

        getStoneTileWidth(iRing: number, iStone: number): number {
            const ring = minigameData.rings[iRing]
            if (!ring) {
                console.warn("No ring with offset", iRing)
                return 0
            }

            let stone = ring.stones[iStone]
            if (!stone) {
                console.warn(`Ring ${iRing} does not have stone ${iStone}`)
                return 0
            }

            return stone.tiles.length
        },
    })

    return board
}
