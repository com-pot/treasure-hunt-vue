<template>
  <div class="mg-zebra-foal">
    <div class="areas">
      <ZebraArea class="waiting-area" :slots="zebras.waiting.value" inline :display-mode="displayMode"
                 :active-index="activePosition === 'waiting' && activeIndex"
                 @slot-clicked="clickSlot('waiting', $event)"/>

      <ZebraArea class="placed-area" :slots="zebras.placed.value" circle :display-mode="displayMode"
                 :active-index="activePosition === 'placed' && activeIndex"
                 @slotClicked="clickSlot('placed', $event)"/>
    </div>

    <div class="controls">
      <button @click="checkValid" class="btn btn-vivid">Test</button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref} from "vue";
import * as ZebraModel from "./Model/ZebraFoalModel";

import ZebraArea from "./ZebraArea.vue";
import ZebraNeighborRule, {NeighborPositions, NeighborRuleEvaluator} from "./Model/ZebraNeighborRule";
import {Zebra} from "./Model/ZebraFoalModel";

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
  },
  setup(props, {emit}) {
    const allZebras = computed<Zebra[]>(() => props.minigameData.zebras)
    const waiting = ref<ZebraModel.ZebraSlot[]>(allZebras.value.slice(1).map((zebra) => ({zebra})))
    const placed = ref<ZebraModel.ZebraSlot[]>(allZebras.value.map((zebra, i) => ({
      zebra: i === 0 ? zebra : undefined,
      locked: i === 0,
    })))
    const activePosition = ref<Position | null>(null)
    const activeIndex = ref(-1)

    const zebras = {placed, waiting};

    const placedZebras = computed<ZebraModel.Zebra[]>(() => placed.value
        .filter((slot) => slot.zebra)
        .map((slot) => slot.zebra as ZebraModel.Zebra))

    function clickSlot(position: Position, index: number) {
      if (position === activePosition.value && index === activeIndex.value) {
        activeIndex.value = -1;
        return;
      }

      let slot = zebras[position].value[index] as ZebraModel.ZebraSlot;

      if (!slot || slot.locked) {
        return;
      }
      if (activeIndex.value === -1 || activePosition.value === null) {
        activePosition.value = position;
        activeIndex.value = index;
      } else {
        let activeSlot = zebras[activePosition.value].value[activeIndex.value] as ZebraModel.ZebraSlot;
        let clickedSlot = zebras[position].value[index] as ZebraModel.ZebraSlot;

        let temp = clickedSlot.zebra;
        clickedSlot.zebra = activeSlot.zebra;
        activeSlot.zebra = temp;

        activeIndex.value = -1;
        clearErrors();
      }
    }
    function clearErrors() {
      zebras.waiting.value.forEach((slot) => slot.hasError = false);
      zebras.placed.value.forEach((slot) => slot.hasError = false);
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
      zebras.waiting.value.forEach((slot: ZebraModel.ZebraSlot) => {
        slot.hasError = !!slot.zebra;
        allPlaced = allPlaced && !slot.zebra;
      });

      return allPlaced;
    }
    function checkAllPlacedAndSated(): boolean {
      zebras.placed.value.forEach((slot: ZebraModel.ZebraSlot, zebraIndex: number) => {
        let zebra = slot.zebra;
        if (!zebra || !zebra.rules) {
          return;
        }

        let rulesSated = zebra.rules.every((rule) => evaluateRule(rule, zebraIndex));
        slot.hasError = !rulesSated;
      });

      return zebras.placed.value.every((slot) => !slot.hasError);
    }
    function evaluateRule(rule: ZebraNeighborRule, zebraIndex: number): boolean {
      if (NeighborPositions.includes(rule[0])) {
        return NeighborRuleEvaluator(placedZebras.value, zebraIndex, rule);
      }

      console.warn("Could not evaluate rule", rule);
      return false;
    }

    return {
      zebras: {
        waiting,
        placed,
      },
      activePosition,
      activeIndex,
      clickSlot,
      checkValid,
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
