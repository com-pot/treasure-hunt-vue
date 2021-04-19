<template>
  <div class="mg-zebra-foal">
    <div class="areas">
      <ZebraArea class="waiting-area" :slots="zebras.waiting" inline :display-mode="displayMode"
                 :active-index="activePosition === 'waiting' && activeIndex"
                 @slot-clicked="clickSlot('waiting', $event)"/>

      <ZebraArea class="placed-area" :slots="zebras.placed" circle :display-mode="displayMode"
                 :active-index="activePosition === 'placed' && activeIndex"
                 @slotClicked="clickSlot('placed', $event)"/>
    </div>

    <div class="controls">
      <button @click="checkValid" class="btn btn-vivid">Test</button>
      <button @click="resetState" class="btn btn-bland">Tak znovu...</button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, reactive, ref, toRef, watch} from "vue";
import * as ZebraModel from "./Model/ZebraFoalModel";

import {twoPartyMultiGroupSwapping} from "@/modules/Minigames/utils/slotSwapping";
import ZebraArea from "./ZebraArea.vue";
import ZebraNeighborRule, {NeighborPositions, NeighborRuleEvaluator} from "./Model/ZebraNeighborRule";
import {Zebra} from "./Model/ZebraFoalModel";
import {useViewStateFromProps} from "@/modules/SotW/utils/useViewState";

type Position = 'waiting' | 'placed';
type ZebraFoalMinigameData = {
  zebras: Zebra[],
  check: string,
}

export default defineComponent({
  components: {ZebraArea},
  props: {
    displayMode: {type: String as PropType<'images' | 'names'>, default: 'images'},
    minigameData: {type: Object as PropType<ZebraFoalMinigameData>, required: true},
    minigameState: {type: Object as PropType<ZebraModel.ZebraFoalViewState>}
  },
  setup(props, {emit}) {
    // Minigame data
    const allZebras = toRef(props.minigameData, 'zebras')

    // Minigame state
    const minigameState = useViewStateFromProps<ZebraModel.ZebraFoalViewState>(props, 'minigameState', () => {
      console.log('init: ', allZebras.value.map((zebra: ZebraModel.Zebra, i: number) => i === 0 ? zebra.name : null))
      return ({
        placements: allZebras.value.map((zebra: ZebraModel.Zebra, i: number) => i === 0 ? zebra.name : null)
      });
    })
    emit('change:minigameState', minigameState)

    // UI State
    const zebras = reactive({
      placed: [] as ZebraModel.ZebraSlot[],
      waiting: [] as ZebraModel.ZebraSlot[],
    })

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


    watch(selectedSlot, (zebraSlot) => console.log(zebraSlot))

    function initUiState(): void {
      zebras.waiting = allZebras.value.slice(1).map((zebra) => ({zebra}))
      zebras.placed = allZebras.value.map((zebra, i) => ({
        zebra: undefined,
        locked: i === 0,
      }))
      console.log(minigameState.placements.map((p) => p))

      minigameState.placements.forEach((zebraName, i) => {
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
        minigameState.placements[i] = zebra?.name || null
      })

    }, {deep: true})

    const activePosition = toRef(swapping, 'selectedGroup')
    const activeIndex = toRef(swapping, 'selectedIndex')

    const placedZebras = computed<ZebraModel.Zebra[]>(() => zebras.placed
        .filter((slot) => slot.zebra)
        .map((slot) => slot.zebra as ZebraModel.Zebra))

    function clearErrors() {
      zebras.waiting.forEach((slot) => slot.hasError = false);
      zebras.placed.forEach((slot) => slot.hasError = false);
    }

    function checkValid(): void {
      let allPlaced = checkNoWaiting();
      let allSated = checkAllPlacedAndSated();

      if (allPlaced && allSated) {
        emit('minigameSignal', {
          type: 'success',
        });
      } else {
        emit('minigameSignal', {
          type: 'error',
        });
      }
    }
    function checkNoWaiting(): boolean {
      let allPlaced = true;
      zebras.waiting.forEach((slot: ZebraModel.ZebraSlot) => {
        slot.hasError = !!slot.zebra;
        allPlaced = allPlaced && !slot.zebra;
      });

      return allPlaced;
    }
    function checkAllPlacedAndSated(): boolean {
      zebras.placed.forEach((slot: ZebraModel.ZebraSlot, zebraIndex: number) => {
        let zebra = slot.zebra;
        if (!zebra || !zebra.rules) {
          return;
        }

        let rulesSated = zebra.rules.every((rule) => evaluateRule(rule, zebraIndex));
        slot.hasError = !rulesSated;
      });

      return zebras.placed.every((slot) => !slot.hasError);
    }

    function evaluateRule(rule: ZebraNeighborRule, zebraIndex: number): boolean {
      if (NeighborPositions.includes(rule[0])) {
        return NeighborRuleEvaluator(placedZebras.value, zebraIndex, rule);
      }

      console.warn("Could not evaluate rule", rule);
      return false;
    }

    return {
      zebras,
      activePosition,
      activeIndex,
      clickSlot: (group: keyof typeof zebras, index: number) => swapping.pickItem(group, index),
      checkValid,
      resetState: () => {
        minigameState.resetState()
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

  .controls {
    margin-block-start: 1em;
    text-align: center;
  }
}
</style>
