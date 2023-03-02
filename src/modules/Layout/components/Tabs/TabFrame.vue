<template>
  <div class="tab-frame">
    <div class="tab-list">
      <button v-for="tab in tabs"
              class="tab" :class="activeTab?.name === tab.name && 'active'"
              @click="setTab(tab.name)">{{ tab.caption }}</button>
    </div>

    <div class="tab-pane">
      <slot v-if="activeTab" :name="'pane-' + (activeTab.pane || activeTab.name)"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"

export type TabEntry = {
  name: string,
  pane?: string,
  caption: string,

  disabled?: boolean | (() => boolean)
}

export default defineComponent({
  props: {
    tabs: {type: Array as PropType<TabEntry[]>, default: [], required: true},
    modelValue: {type: String},
  },

  setup(props, {emit, slots}) {

    function isEnabled(tab: TabEntry): boolean {
      if (!slots['pane-' + (tab.pane || tab.name)]) {
        return false
      }

      let disabled = tab.disabled
      if (typeof disabled === 'function') {
        disabled = disabled()
      }

      return !disabled
    }

    const activeTab = computed(() => {
      let tab = props.tabs.find((tab) => tab.name === props.modelValue && isEnabled(tab))
      if (!tab) {
        tab = props.tabs.find((tab) => isEnabled(tab))
        if (tab) {
          emit('update:modelValue', tab.name)
        }
      }
      return tab
    })

    function setTab(tabName: string) {
      const tab = props.tabs.find((tab) => tab.name === tabName)
      if (tab && isEnabled(tab)) {
        emit('update:modelValue', tabName)
      }
    }

    return {
      activeTab,
      setTab,
    }
  },
})
</script>

<style lang="scss">
.tab-frame {
  display: flex;
  flex-direction: column;

  .tab-list {
    display: flex;
  }

  .tab {
    border: none;
    appearance: none;
    padding: 1rem 0.5rem;
    background: var(--neutral-800);

    &.active {
      background: var(--neutral-900);
    }
  }

  .tab-pane {
    --padding: 1rem;
    background: var(--neutral-900);

    padding: var(--padding);

    .flush {
      margin-inline: calc(-1 * var(--padding));
      width: calc(100% + 2 * var(--padding));
    }
  }
}
</style>
