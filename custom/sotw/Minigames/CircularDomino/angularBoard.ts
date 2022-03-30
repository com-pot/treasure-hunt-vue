import {computed, reactive} from "vue"

import trigonometry, {Degrees, Point2D, PointRad2D, Radians} from "@src/utils/trigonometry"
import * as Model from "./Model/CircularDominoModel"
import velocityUtils from "@src/utils/velocityUtils"
import Resources from "@src/utils/Resources"

export type UiConfig = {
    debug: boolean,
    dominoCircle: { radius: number },

    renderSize: number,
    clientSize: number,

    dimensions: {
        ringHeightRampStart: number,
        ringHeightRampTrend: number,
    },
    ringAngularVelocity: Radians[],
    resources: {
        ringBg: HTMLImageElement | string,
        [name: string]: HTMLImageElement | string,
    },
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
        let innerRadius = ui.renderSize / 2 - 10
        let ringHeight = ui.dimensions.ringHeightRampStart
        let ringHeights = []
        for (let i = 0; i < minigameData.rings.length; i++) {
            ringHeights.push(ringHeight)
            innerRadius -= ringHeight
            ringHeight = ringHeight + ui.dimensions.ringHeightRampTrend;
        }

        let ringsDimensions: RingDimensions[] = []
        for (let iRing = 0; iRing < ringTileCounts.value.length; iRing++) {
            let tileWidth = pi2 / ringTileCounts.value[iRing]
            let ringHeight = ringHeights[iRing]
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
    const speedLimit = Math.PI * 1.5

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

    const getRingDragForce = (iRing: number): Radians | undefined => {
        if (drag.iRing === -1) {
            return undefined
        }
        const dragForce = velocityUtils.angleToVelocity(drag.currentPosition!.angle - drag.holdOffset!.angle - state.ringsAngles[drag.iRing])

        if (iRing === drag.iRing) {
            return dragForce
        }

        if (drag.sideDrag && iRing in drag.sideDrag) {
            return drag.sideDrag[iRing] * dragForce
        }

        return undefined
    }

    const getRingCombinedForce = (iRing: number): Radians => {
        let debugForce = (window as any).debugForce as Radians
        if (debugForce) {
            return debugForce
        }

        const dragForce = debugForce || getRingDragForce(iRing)
        const snapForce = velocityUtils.angleToVelocity(ringsSnaps.value[iRing].snapAngle - state.ringsAngles[iRing])
        if (dragForce !== undefined) {
            return dragForce * 0.85 + snapForce * 0.15
        }
        return snapForce
    }

    const updateRings = (t: number, dt: number): boolean => {
        const dts = dt * 0.001
        let updated = false
        const momentum = 0.4
        const friction = 0.2

        for (let iRing = 0; iRing < minigameData.rings.length; iRing++) {
            const speedLimitRing = speedLimit - iRing
            const combinedForce = getRingCombinedForce(iRing)
            let dVel = combinedForce * (1 - momentum)

            let newVel = ui.ringAngularVelocity[iRing] + (dVel * dts)
            let newVelAbs = Math.abs(newVel)
            if (newVelAbs <= 0.01 * dts) {
                ui.ringAngularVelocity[iRing] = 0
                continue
            } else if (newVelAbs > speedLimitRing) {
                newVelAbs = speedLimitRing
                newVel = Math.sign(newVel) * newVelAbs
            }
            let ringFriction = newVel * friction
            ui.ringAngularVelocity[iRing] = newVel - ringFriction * dts

            const dRad = ui.ringAngularVelocity[iRing] * (dt * 0.001)
            state.ringsAngles[iRing] = normalizeAngle(state.ringsAngles[iRing] + dRad)
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

        sideDrag: undefined as Model.RingSideDrag | undefined,

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
                drag.sideDrag = minigameData.rings[iRing].sideDrag
            }
        },
        end() {
            if (drag.iRing !== -1) {
                drag.iRing = -1
                drag.holdOffset = drag.currentPosition = null
            }

            drag.sideDrag = undefined
        },
        move(x: number, y: number) {
            if (drag.iRing !== -1) {
                drag.currentPosition = board.angularPosition(x * renderScale.value, y * renderScale.value)
            }
        },
    })

    const draw = {
        frame([gBackground, gSymbols]: [CanvasRenderingContext2D, CanvasRenderingContext2D]) {
            gBackground.clearRect(0, 0, ui.renderSize, ui.renderSize)
            gSymbols.clearRect(0, 0, ui.renderSize, ui.renderSize)

            for (let iRing = 0; iRing < minigameData.rings.length; iRing++) {
                draw.renderRing(gBackground, gSymbols, iRing)
            }
        },
        renderRing(g: CanvasRenderingContext2D, gSymbols: CanvasRenderingContext2D, iRing: number) {
            let ring = minigameData.rings[iRing]
            let ringDimensions: RingDimensions = ringsDimensions.value[iRing]

            let renderedTiles = 0
            for (let iStone = 0; iStone < ring.stones.length; iStone++) {
                let stone = ring.stones[iStone]
                let stoneTileStart = renderedTiles

                for (let iTile = 0; iTile < stone.tiles.length; iTile++) {
                    const tile = stone.tiles[iTile]
                    const angle = state.ringsAngles[iRing] + renderedTiles * ringDimensions.tileWidth
                    draw.renderTile(g, tile, angle, ringDimensions, iStone * 7 + iTile * 11, iRing * 3)
                    draw.renderPieceSymbol(gSymbols, tile, angle, ringDimensions, tile.fgColor || "black")
                    renderedTiles++
                }

                let stoneAngleStart = state.ringsAngles[iRing] + stoneTileStart * ringDimensions.tileWidth
                let stoneWidth = stone.tiles.length * ringDimensions.tileWidth
                g.strokeStyle = "black"
                g.lineWidth = 1
                draw.pathBlock(g, ringDimensions.outerRadius, ringDimensions.innerRadius, stoneAngleStart, stoneAngleStart + stoneWidth)
                g.stroke()
            }

            const distanceToSnap = trigonometry.minAngleDiff(state.ringsAngles[iRing], ringsSnaps.value[iRing].snapAngle)
            let snapPrecision = (ringDimensions.tileWidth - Math.abs(distanceToSnap * 2)) / (ringDimensions.tileWidth)
            g.globalAlpha = Math.max((snapPrecision - 0.5) * 2, 0)
            let snappedStone = minigameData.rings[iRing].stones[ringsSnaps.value[iRing].snapIndex]
            draw.strokeTarget(g, ringDimensions.radius, (ringDimensions.outerRadius - ringDimensions.innerRadius - 10) * 0.5, snappedStone.tiles[0].fgColor || "")
            g.globalAlpha = 1
        },
        renderTile(g: CanvasRenderingContext2D, tile: Model.Tile, angle: Radians, dimensions: RingDimensions, xRand: number, yRand: number) {
            draw.pathBlock(g, dimensions.outerRadius, dimensions.innerRadius, angle, angle + dimensions.tileWidth)

            const p = board.circuitPosition(angle, dimensions.radius)
            g.translate(p.x, p.y)
            g.rotate(angle + (xRand + yRand) * 0.2)
            g.fillStyle = g.createPattern(board.resources.get("ringBg"), "repeat")!
            g.fill()
            g.globalAlpha = 0.325
            g.fillStyle = 'chocolate'
            g.fill()
            g.globalAlpha = 0.025
            g.fillStyle = tile.bgColor
            g.fill()
            g.globalAlpha = 1

            g.resetTransform()
        },
        renderPieceSymbol(g: CanvasRenderingContext2D, piece: Model.Tile, angle: Radians, dimensions: RingDimensions, fgColor: string) {
            g.font = '16pt Sans-Serif'
            g.fillStyle = fgColor

            let textAngle = angle + dimensions.tileWidth * 0.5
            let p = board.circuitPosition(textAngle, dimensions.radius)
            g.translate(p.x, p.y)
            g.rotate(textAngle + Math.PI * 0.5)

            let tm = (dimensions.outerRadius - dimensions.innerRadius) * 0.5
            const img = board.resources.get(piece.symbol)
            g.drawImage(img, tm * -0.5, tm * -0.5, tm, tm)

            g.globalCompositeOperation = "source-atop"
            g.fillStyle = fgColor
            g.fillRect(tm * -0.5, tm * -0.5, tm, tm)

            g.globalCompositeOperation = "source-over"

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
        strokeTarget(g: CanvasRenderingContext2D, rRing: number, rTarget: number, color: string) {
            const targetPos = board.circuitPosition(Math.PI * -0.5, rRing)
            g.translate(targetPos.x, targetPos.y)

            g.strokeStyle = color
            g.lineWidth = 2
            g.beginPath()
            g.ellipse(0, 0, rTarget, rTarget, 0, 0, 360)
            g.closePath()
            g.stroke()

            g.resetTransform()
        },
    }

    const resPrepared: { [name: string]: HTMLImageElement } = Object.fromEntries(Object.entries(ui.resources).map((entry) => {
        if (entry[1] instanceof HTMLImageElement) {
            return entry as [string, HTMLImageElement]
        }
        const image = new Image()
        image.src = entry[1]
        return [entry[0], image]
    }))

    const board = reactive({
        resources: new Resources(resPrepared),

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
