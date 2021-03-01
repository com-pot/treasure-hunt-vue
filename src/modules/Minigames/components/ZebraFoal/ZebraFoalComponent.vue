<template>
  <div class="mg-zebra-foal">
    <div class="help">
      <p v-for="zebra in helpfulZebras" :key="zebra.name">{{zebra.helpText}}</p>
    </div>
    <div class="areas">
      <ZebraArea class="waiting-area" :slots="zebras.waiting"
                 :active-index="activePosition === 'waiting' && activeIndex"
                 @slot-clicked="clickSlot('waiting', $event)"/>

      <ZebraArea class="placed-area" :slots="zebras.placed"
                 :active-index="activePosition === 'placed' && activeIndex"
                 @slotClicked="clickSlot('placed', $event)"/>
    </div>
    <div class="controls">
      <button @click="checkValid" class="btn btn-vivid">Test</button>
    </div>


  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import * as ZebraModel from "./Model/ZebraFoalModel";

import {sotwZebras} from "./ZebrasSotw";
import ZebraArea from "./ZebraArea.vue";
import ZebraNeighborRule, {NeighborPositions, NeighborRuleEvaluator} from "./Model/ZebraNeighborRule";
import {Zebra} from "./Model/ZebraFoalModel";

type Position = 'waiting' | 'placed';

export default defineComponent({
  components: {ZebraArea},
  data() {
    let waiting = sotwZebras.slice(1).map((zebra, i) => ({zebra} as ZebraModel.ZebraSlot));

    let placed = sotwZebras.map((zebra, i) => ({
      zebra: i === 0 ? zebra : undefined,
      locked: i === 0,
    } as ZebraModel.ZebraSlot));

    return {
      allZebras: sotwZebras,
      zebras: {
        waiting,
        placed,
      },
      activePosition: null as Position | null,
      activeIndex: -1,
    };
  },
  computed: {
    helpfulZebras(): Zebra[] {
      return this.allZebras.filter((zebra) => zebra.helpText);
    },
    placedZebras(): ZebraModel.Zebra[] {
      return this.zebras.placed
        .filter((slot) => slot.zebra)
        .map((slot) => slot.zebra as ZebraModel.Zebra);
    },
  },
  methods: {
    clickSlot(position: Position, index: number) {
      if (position === this.activePosition && index === this.activeIndex) {
        this.activeIndex = -1;
        return;
      }

      let slot = this.zebras[position][index] as ZebraModel.ZebraSlot;

      if (!slot || slot.locked) {
        return;
      }
      if (this.activeIndex === -1 || this.activePosition === null) {
        this.activePosition = position;
        this.activeIndex = index;
      } else {
        let activeSlot = this.zebras[this.activePosition][this.activeIndex] as ZebraModel.ZebraSlot;
        let clickedSlot = this.zebras[position][index] as ZebraModel.ZebraSlot;

        let temp = clickedSlot.zebra;
        clickedSlot.zebra = activeSlot.zebra;
        activeSlot.zebra = temp;

        this.activeIndex = -1;
        this.clearErrors();
      }


    },
    clearErrors() {
      let slots: ZebraModel.ZebraSlot[] = this.zebras.waiting;
      slots.forEach((slot) => slot.hasError = false);
      slots = this.zebras.placed;
      slots.forEach((slot) => slot.hasError = false);
    },
    checkValid(): boolean {
      let allPlaced = this.checkNoWaiting();
      let allSated = this.checkAllPlacedAndSated();

      if (allPlaced && allSated) {
        this.$emit('minigameSignal', {
          type: 'success',
        });
        return true;
      }
      return false;
    },
    checkNoWaiting(): boolean {
      let allPlaced = true;
      this.zebras.waiting.forEach((slot: ZebraModel.ZebraSlot) => {
        slot.hasError = !!slot.zebra;
        allPlaced = allPlaced && !slot.zebra;
      });

      return allPlaced;
    },
    checkAllPlacedAndSated(): boolean {
      let allSated = true;
      let zebraIndex = 0;
      this.zebras.placed.forEach((slot: ZebraModel.ZebraSlot) => {
        let zebra = slot.zebra;
        if (!zebra || !zebra.rules) {
          return;
        }

        let rulesSated = zebra.rules.every((rule, i) => this.evaluateRule(rule, zebraIndex));
        slot.hasError = !rulesSated;
        allSated = allSated && rulesSated;
        zebraIndex++;
      });

      return allSated;
    },
    evaluateRule(rule: ZebraNeighborRule, zebraIndex: number): boolean {
      if (NeighborPositions.includes(rule[0])) {
        return NeighborRuleEvaluator(this.placedZebras, zebraIndex, rule);
      }

      console.warn("Could not evaulate rule", rule);
      return false;
    },
  },
})
</script>

<style lang="scss">
.mg-zebra-foal {
  .areas {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
  }

  .controls {
    margin-block-start: 1em;
    text-align: center;
  }


  --item-color: #eee;

  .selected {
    --item-color: #cedace;
  }

  .locked {
    --item-color: #aaa;
  }

  .error {
    --item-color: blueviolet;
  }

}
</style>
