<template>
  <div class="mg-zebra-foal">
    <div class="areas">
      <ZebraArea class="waiting-area" :slots="zebras.waiting" arrangement="inline" :display-mode="displayMode"
                 :active-index="swapping.selectedGroup === 'waiting' && swapping.selectedIndex"
                 @slot-clicked="clickSlot('waiting', $event)"/>

      <ZebraArea class="placed-area" :slots="zebras.placed" arrangement="circle" :display-mode="displayMode"
                 :pipe-position="pipePosition" :pipe-rewind="pipeRewind"
                 :active-index="swapping.selectedGroup === 'placed' && swapping.selectedIndex"
                 @slotClicked="clickSlot('placed', $event)"/>
    </div>


    <MinigameControls :check-solution="checkValid" :reset="resetState"/>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, reactive, ref, toRef, watch} from "vue";
import * as ZebraModel from "./Model/ZebraFoalModel";
import {Zebra} from "./Model/ZebraFoalModel";

import {twoPartyMultiGroupSwapping} from "@/modules/Minigames/utils/slotSwapping";
import ZebraArea from "./ZebraArea.vue";
import ZebraNeighborRule, {NeighborPositions, NeighborRuleEvaluator} from "./Model/ZebraNeighborRule";
import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue";
import {resolveAfter} from "@/utils/promiseUtils";

type Position = 'waiting' | 'placed';
type ZebraFoalMinigameData = {
  zebras: Zebra[],
  check: string,
}

export default defineComponent({
  components: {MinigameControls, ZebraArea},
  inheritAttrs: false,
  props: {
    displayMode: {type: String as PropType<'images' | 'names'>, default: 'images'},
  },
  setup(props, {emit}) {
    const minigameData = useViewData<ZebraFoalMinigameData>()
    const allZebras = toRef(minigameData.value, 'zebras')

    const minigameState = useViewState<ZebraModel.ZebraFoalViewState>(() => ({
      placements: allZebras.value.map((zebra: ZebraModel.Zebra, i: number) => i === 0 ? zebra.name : null)
    }))
    const placements = computed(() => minigameState.value.placements)

    // UI State
    const zebras = reactive({
      placed: [] as ZebraModel.ZebraSlot[],
      waiting: [] as ZebraModel.ZebraSlot[],
    })
    const pipePosition = ref<number | undefined>(undefined)
    const pipeRewind = ref(false)

    const swapping = twoPartyMultiGroupSwapping<ZebraModel.ZebraSlot, typeof zebras>(zebras)
    const selectedSlot = computed(() => swapping.selectedGroup !== null && swapping.selectedIndex !== null
        ? zebras[swapping.selectedGroup as keyof typeof zebras][swapping.selectedIndex as number] : null)
    swapping.canPickItem = (slot) => !slot.locked && !!(slot.zebra || selectedSlot.value?.zebra)
    swapping.swapItems = (slot1, slot2) => {
      const zebra = slot1.zebra
      slot1.zebra = slot2.zebra
      slot2.zebra = zebra
      return false
    }
    swapping.onSwap = () => clearErrors()


    function initUiState(): void {
      zebras.waiting = allZebras.value.slice(1).map((zebra) => ({zebra}))
      zebras.placed = allZebras.value.map((zebra, i) => ({
        zebra: undefined,
        locked: i === 0,
      }))

      placements.value.forEach((zebraName, i) => {
        if (zebraName) {
          zebras.placed[i].zebra = allZebras.value.find((zebra) => zebra.name === zebraName)
          zebras.waiting.forEach((slot) => {
            if (slot.zebra?.name === zebraName) {
              slot.zebra = undefined
            }
          })
        }
      })
    }

    initUiState()

    watch(() => zebras.placed, (placed) => {
      placed.forEach(({zebra}, i) => {
        placements.value[i] = zebra?.name || null
      })

    }, {deep: true})

    const placedZebras = computed<ZebraModel.Zebra[]>(() => zebras.placed
        .filter((slot) => slot.zebra)
        .map((slot) => slot.zebra as ZebraModel.Zebra))

    function clearErrors() {
      zebras.waiting.forEach((slot) => slot.hasError = false);
      zebras.placed.forEach((slot) => slot.hasError = false);
    }

    function checkValid(): Promise<void> {
      checkNoWaiting()

      return checkAllPlacedAndSated()
          .then((allSated) => {
            emit('minigameSignal', {
              type: allSated ? 'success' : 'error',
            })
            if (!allSated) {
              pipePosition.value = undefined
            } else {
              checkPipePosition()
            }
          })
    }

    function checkNoWaiting(): boolean {
      let allPlaced = true;
      zebras.waiting.forEach((slot: ZebraModel.ZebraSlot) => {
        slot.hasError = !!slot.zebra;
        allPlaced = allPlaced && !slot.zebra;
      });

      return allPlaced;
    }

    async function checkAllPlacedAndSated(): Promise<boolean> {
      for (let i = 0; i < zebras.placed.length; i++) {
        pipePosition.value = i
        await resolveAfter(420)

        const slot = zebras.placed[i]
        const zebra = slot.zebra as Zebra
        if (!zebra || !zebra.rules) {
          slot.hasError = true
          continue
        }

        let rulesSated = zebra.rules.every((rule) => evaluateRule(rule, i));
        slot.hasError = !rulesSated;
        await resolveAfter(420)
      }

      pipePosition.value = zebras.placed.length
      await resolveAfter(420)

      return zebras.placed.every((slot) => !slot.hasError);
    }

    function evaluateRule(rule: ZebraNeighborRule, zebraIndex: number): boolean {
      if (NeighborPositions.includes(rule[0])) {
        return NeighborRuleEvaluator(placedZebras.value, zebraIndex, rule);
      }

      console.warn("Could not evaluate rule", rule);
      return false;
    }

    function checkPipePosition() {
      const pos = pipePosition.value
      const items = placements.value.length
      if (pos === undefined || pos < items) {
        return
      }

      pipeRewind.value = true
      return resolveAfter(42)
          .then(() => {
            pipePosition.value = pos - items
            return resolveAfter(42)
          })
          .finally(() => pipeRewind.value = false)
    }

    return {
      zebras,
      pipePosition,
      pipeRewind,

      swapping,
      clickSlot: (group: keyof typeof zebras, index: number) => swapping.pickItem(group, index),
      checkValid,
      resetState: () => {
        minigameState.reset()
        initUiState()
      },
    };
  },
})
</script>

<style lang="scss">
.mg-zebra-foal {
  .areas {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .placed-area {
    width: 100%;
    height: 420px;
  }
}
</style>
