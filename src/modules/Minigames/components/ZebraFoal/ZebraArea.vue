<template>
  <ul :class="['zebra-area', arrangement, displayMode, pipeRewind && 'pipe-rewind']" :style="areaStyles">
    <li v-for="(slot, i) in slots" :key="i" @click="$emit('slotClicked', i)"
        :style="{'--order': i, '--image': getImage(slot)}"
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
      </div>
    </li>
    <li v-if="showPipe" class="pipe" :style="'--position:' + pipePosition">
      <div class="zebra-slot">PP</div>
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
    arrangement: {type: String as PropType<'inline' | 'circle'>, default: 'inline'},
    displayMode: {type: String as PropType<'images' | 'names'>, default: 'images'},
    slots: {type: Array as PropType<ZebraSlot[]>, required: true},
    activeIndex: [Number, Boolean],
    pipePosition: Number,
    pipeRewind: Boolean,
  },
  computed: {
    areaStyles() {
      if (this.arrangement !== 'circle') {
        return null
      }
      return {
        '--slice-angle': this.sliceDegrees + 'deg',
      }
    },
    sliceDegrees(): number {
      return 360 / this.slots.length;
    },
    showPipe(): boolean {
      return typeof this.pipePosition === "number"
    }
  },
  methods: {
    getImage(slot: ZebraSlot): string|undefined {
      if (this.displayMode !== 'images' || !slot.zebra) {
        return
      }

      return 'url("/minigames/shamans/' + slot.zebra.name + '.png")';
    },
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
    --item-color: blueviolet;
  }

  .zebra-slot {
    width: 64px;
    height: 32px;

    display: flex;
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

      position: absolute;
      top: calc(50% - 16px);
      left: 50%;

      width: 42%;

      transform-origin: 0 50%;
      transform: rotate(var(--angle));
    }

    .zebra-slot {
      margin-inline-start: auto;
      transform: rotate(calc(-1 * var(--angle, 0deg)));
    }

    .pipe {
      --angle: calc(var(--slice-angle) * var(--position));

      transition: all var(--pipe-animation-time) ease;

      div {
        display: flex;
        box-shadow: #42b983 4px 4px 4px 2px;

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

      &:before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background-image: var(--image);
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }
    }
  }


  --pipe-animation-time: 0.5s;
  &.pipe-rewind {
    --pipe-animation-time: 0s;
  }
}

</style>
