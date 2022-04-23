<template>
  <nav class="entity-picker">
    <div class="parts">
      <p class="status-text" v-if="!items">{{ loadingText }}</p>
      <p class="status-text" v-else-if="!items.length">{{ emptyText }}</p>

      <template v-else>
        <div class="part" :class="modelValue === item[itemKey] && 'active'" v-for="(item, i) in items" :key="item[itemKey]"
             :data-key="item[itemKey]"
             @click="emit('update:model-value', item[itemKey])"
        >
          <slot name="item" :item="item"></slot>
        </div>
      </template>
    </div>

    <button class="btn add-btn" @click="add" v-if="add">+</button>
  </nav>
</template>

<script lang="ts" setup>
import {PropType} from "vue"

const props = defineProps({
  items: {type: Array as PropType<any[]>},
  itemKey: {type: String, required: true},

  modelValue: {type: String},

  loadingText: {type: String, default: 'Načítám...'},
  emptyText: {type: String, default: 'Žádné položky'},

  add: Function as PropType<(payload: MouseEvent) => void>,
})
const emit = defineEmits(['update:model-value'])
</script>

<style lang="scss">
.entity-picker {
  --nav-bg: var(--neutral-950);
  --fade-size: 2rem;
  display: grid;
  gap: 0.5rem;

  background: var(--nav-bg);

  > *, &:before, &:after {
    grid-column: 1;
    grid-row: 1;
  }

  .parts {
    z-index: 1;

    display: grid;
    grid-auto-flow: column;
    gap: 0.5rem;
    overflow-x: auto;

    padding: 0.25rem var(--fade-size, 0.5rem);
  }

  &[data-layout="book"] .parts {
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    grid-auto-flow: row;
  }

  .part {
    padding: 0.2rem;
    border: 2px solid var(--neutral-600);
    background: var(--neutral-800);

    &.active {
      background: var(--neutral-900);
      border-color: var(--primary-800);
    }
  }

  &:before, &:after {
    z-index: 2;
    pointer-events: none;

    content: '';
    display: block;
    width: var(--fade-size);
  }

  &:before {
    place-self: stretch start;
    background: linear-gradient(to left, transparent 0%, var(--nav-bg) 42%);
  }

  &:after {
    place-self: stretch end;
    background: linear-gradient(to right, transparent 0%, var(--nav-bg) 42%);
  }

  .add-btn {
    z-index: 3;
    place-self: center end;
    padding: 0.2rem;
    margin: 0.2rem;
  }
}
</style>
