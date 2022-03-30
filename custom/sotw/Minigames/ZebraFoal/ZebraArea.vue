<template>
  <ul :class="['zebra-area', arrangement, displayMode, pipeRewind && 'pipe-rewind']" :style="areaStyles">
    <li v-for="(slot, i) in slots" :key="i" @click="$emit('slotClicked', i)"
        :style="'--order: ' + i"
    >
      <div :class="[
          'zebra-slot',
           slot.zebra ? 'occupied' : 'empty',
           slot.locked && 'locked',
           slot.hasError && 'error',
           activeIndex === i && 'selected',
        ]">
        <span class="name" v-if="!slot.zebra">---</span>
        <span class="name" v-else>{{ slot.zebra.name }}</span>
        <img v-if="displayMode === 'images' && slot.zebra" :src="getSlotImage(slot.zebra)">
      </div>
    </li>
    <li v-if="showPipe" class="pipe" :style="'--position:' + pipePosition">
      <div class="zebra-slot"></div>
    </li>
  </ul>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {Zebra, ZebraSlot} from "./Model/ZebraFoalModel";

export default defineComponent({
  emits: {
    slotClicked(payload: number) {
      return payload >= 0;
    },
  },
  props: {
    arrangement: {type: String as PropType<'inline' | 'circle'>, default: 'inline'},
    displayMode: {type: String as PropType<'images' | 'names'>, default: 'images'},
    slots: {type: Array as PropType<ZebraSlot[]>, required: true},
    activeIndex: {type: [Number, Boolean]},
    pipePosition: Number,
    pipeRewind: Boolean,
  },
  computed: {
    areaStyles() {
      if (this.arrangement !== 'circle') {
        return
      }
      return `--slice-angle: ${this.sliceDegrees}deg`
      
    },
    sliceDegrees(): number {
      return 360 / this.slots.length;
    },
    showPipe(): boolean {
      return typeof this.pipePosition === "number"
    },
  },
  methods: {
    getSlotImage: (zebra?: Zebra): string | undefined => zebra && '/minigames/shamans/' + zebra.name + '.png'
  },
});
</script>

<style lang="scss">

.zebra-area {
  list-style: none;
  margin: 0;

  --item-color: #eee;

  .selected {
    --item-color: #cedace;
  }

  .locked {
    --item-color: #aaa;
  }

  .error {
    --item-color: var(--hsl-vile);
  }

  .zebra-slot {
    width: 64px;
    height: 32px;

    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    box-shadow: 2px 2px 8px 4px rgba(lightgray, 0.25);

    transition: background-color 0.3s ease;

    &.occupied {
      background: var(--item-color);
    }

    &.empty {
      border: 1px solid var(--item-color);
    }
  }

  &.circle {
    margin-top: 2em;
    margin-bottom: 2em;

    position: relative;
    z-index: 1;

    li {
      --angle: calc(var(--slice-angle) * var(--order));

      text-align: right;

      position: absolute;
      top: calc(50% - 16px);
      left: 50%;

      width: 42%;

      transform-origin: 0 50%;
      transform: rotate(var(--angle));
    }

    .zebra-slot {
      transform: rotate(calc(-1 * var(--angle, 0deg)));
    }

    .pipe {
      pointer-events: none;
      --angle: calc(var(--slice-angle) * var(--position));

      transition: all var(--pipe-animation-time) ease;

      div {
        display: inline-flex;
        box-shadow: var(--hsl-vivid) 4px 4px 4px 2px;

        transition: all var(--pipe-animation-time) ease;
      }
    }
  }

  &.inline {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    margin-inline-end: -0.25em;

    li {
      margin-inline-end: 0.25em;
      margin-block-end: 0.25em;
    }
  }

  &.images {
    .zebra-slot {
      width: 72px;
      height: 72px;
      padding: 4px;

      .name {
        display: none;
      }

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }


  --pipe-animation-time: 0.5s;
  &.pipe-rewind {
    --pipe-animation-time: 0s;
  }
}

</style>
