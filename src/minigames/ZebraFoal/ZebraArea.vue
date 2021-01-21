<template>
  <ul class="zebra-area">
    <li v-for="(slot, i) in slots" :key="i" @click="$emit('slotClicked', i)"
        :class="[
          'zebra-slot',
           slot.zebra ? 'occupied' : 'empty',
           slot.locked && 'locked',
           slot.hasError && 'error',
           activeIndex === i && 'selected',
        ]"
    >
      <span v-if="!slot.zebra">---</span>
      <span v-else>{{ slot.zebra.name }}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {ZebraSlot} from "./Model/ZebraFoalModel";

export default defineComponent({
  emits: {
    slotClicked(payload: number) {
      return payload >= 0;
    },
  },
  props: {
    slots: {type: Array  as PropType<ZebraSlot[]>, required: true},
    activeIndex: [Number, Boolean],
  },

  methods: {
    onPlaceClicked(i: number) {

    },
  },
});
</script>

<style lang="scss">
.zebra-area {
  list-style: none;
  margin: 0;

  .zebra-slot {
    width: 64px;
    height: 32px;

    display: flex;
    justify-content: center;
    align-items: center;

    &:not(:last-child) {
      margin-block-end: 0.1em;
    }

    &.occupied {
      background: var(--item-color);
    }

    &.empty {
      border: 1px solid var(--item-color);
    }
  }
}

</style>
