<script lang="ts">
import {computed, defineComponent, h, PropType, reactive, withModifiers} from "vue"
import {useInputRegistry} from "@src/modules/Typeful/inputs/inputRegistry"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"

type BtnSpec = {
  caption: string,
  action: () => unknown,
  class?: string,
  disabled?: boolean,
}

export default defineComponent({
  props: {
    modelValue: {type: Array},
    keyPath: {type: String},

    tag: {type: String, default: 'div'},
    label: {type: String},

    innerType: {type: Object as PropType<InputSpec>},
    createItem: {type: Function},
    addItem: {type: [Function, Boolean], default: false},
    removeItem: {type: [Function, Boolean], default: true},
  },

  setup(props, {attrs, slots}) {
    const inputRegistry = useInputRegistry()

    const listCtrl = reactive({
      add: computed(() => {
        if (typeof props.addItem === 'function') {
          return props.addItem
        }

        if (props.createItem && props.modelValue) {
          return () => props.modelValue.push(props.createItem())
        }
        return false
      }),
      remove: computed(() => {
        if (props.removeItem === true && props.modelValue) {
          return (item: unknown, index: number) => {
            console.log('splice', index)
            return props.modelValue.splice(index, 1)
          }
        }
        return props.removeItem
      }),
      shift(index: number, dPos: number) {
        if (!dPos) return
        const targetPosition = index + dPos
        if (targetPosition < 0 || targetPosition >= props.modelValue.length) {
          console.warn("Attempted to shift item out of bounds: ", {index, dPos})
          return
        }
        const itemsToBeShifted = props.modelValue.splice(index, 1)
        props.modelValue.splice(targetPosition, 0, ...itemsToBeShifted)
      },
    })

    const itemsControlButtons = computed(() => (props.modelValue || []).map((item, i, allItems) => {
      const btns: BtnSpec[] = []
      if (typeof listCtrl.remove === 'function') {
        const removeFn = listCtrl.remove
        btns.push({
          caption: 'R',
          action: () => removeFn(item, i),
          class: '-acc-danger',
        })
      }

      btns.push(
        {
          caption: "⇑",
          action: () => listCtrl.shift(i, -1),
          disabled:  i <= 0,
        },
        {
          caption: "⇓",
          action: () => listCtrl.shift(i, +1),
          disabled: i >= allItems.length - 1,
        },
      )

      return btns
    }))

    const createContentElement = (item: any, index: number) => {
      if (slots.item) {
        return h(slots.item, {item, index})
      }

      const itemTypeInput = props.innerType?.type && inputRegistry.get(props.innerType.type)
      if (itemTypeInput) {
        return h(itemTypeInput, {
          ...props.innerType,
          key: index,
          modelValue: item,
          'onUpdate:modelValue': (value) => {
            props.modelValue[index] = value
          },
        })
      }

      return h('div', {class: 'content'}, `[${index}]` + JSON.stringify(item))
    }

    return () => {
      const itemElements = props.modelValue?.map((item, i) => {
        const controlBtnEls = itemsControlButtons.value[i].map((btn) => h('button', {
          class: ['btn', btn.class],
          onClick: withModifiers(btn.action, ['prevent']),
          disabled: btn.disabled === true ? true : undefined,
        }, btn.caption))
        const controlsEl = h('div', {class: 'controls'}, controlBtnEls)
        const contentEl = createContentElement(item, i)

        return h('div', {class: 'list-item'}, [controlsEl, contentEl])
      })

      let listControlsElements = [
        typeof listCtrl.add === 'function' && h('button', {
          class: 'btn',
          onClick: withModifiers(listCtrl.add, ['prevent']),
        }, ['+']),
      ].filter((btn) => (btn))
      if (props.label) {
        listControlsElements.unshift(h('label', [props.label]))
      }

      return h(props.tag, {class: 'flow tf-list'}, [
        h('div', {class: 'controls'}, listControlsElements),
        itemElements,
      ])
    }
  }
})
</script>

<style lang="scss">
.tf-list {
  .list-item {
    display: flex;

    > .controls {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      padding-inline-end: 0.5rem;
      border-inline-end: var(--primary-500) 1px solid;

      + :not(.tile) {
        margin-inline-start: 0.5rem;
      }
    }
  }

  .controls {
    > .btn {
      padding: 0.1em;
    }
    + * {
      flex: 1;
    }
  }
}
</style>
