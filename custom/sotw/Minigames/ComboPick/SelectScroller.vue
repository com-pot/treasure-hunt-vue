<template>
  <div class="select-scroller" ref="scrollContainer">
    <button v-for="(option, i) in optionsOrdered" :key="i + '-' + option"
            :class="['btn', modelValue === option ? 'btn-success' :'btn-bland']"
            @click="$emit('update:modelValue', option)">
      <span>{{ option }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, PropType, ref, watch} from "vue"
import {debounce} from "@src/utils/timingUtils"

export default defineComponent({
  props: {
    options: {type: Array as PropType<string[]>, required: true},
    modelValue: {type: String},
  },

  setup(props, {emit}) {
    const scrollContainer = ref<HTMLDivElement>()
    const optionsOrdered = ref<string[]>([])

    function rotateBy<T=any>(options: T[], positions: number): T[] {
      options = options.slice()
      while (positions > 0) {
        options.unshift(options.pop()!)
        positions--
      }
      while (positions < 0) {
        options.push(options.shift()!)
        positions++
      }
      return options
    }

    function rotateOptionsOrderedToActiveItem(): void {
      const middle = Math.floor(optionsOrdered.value.length * 0.5)
      if (props.modelValue === undefined) {
        return
      }
      const activeIndex = optionsOrdered.value.indexOf(props.modelValue)
      if (activeIndex === -1) {
        console.warn("Active not present")
        return
      }

      let positions = middle - activeIndex
      optionsOrdered.value = rotateBy(optionsOrdered.value, positions)
      compensateRotation(positions)
    }

    watch(() => props.modelValue, () => {
      rotateOptionsOrderedToActiveItem()
    })
    watch(() => props.options, (options) => {
      optionsOrdered.value.splice(0)
      optionsOrdered.value.push(...options)
      rotateOptionsOrderedToActiveItem()
    }, {immediate: true})

    function findCenterItemIndex(container: HTMLDivElement): number {
      const containerScrollCenter = container.scrollTop + container.clientHeight * 0.5

      let iMinDistance = -1
      let minDistance = Number.MAX_SAFE_INTEGER

      let scannedHeight = 0
      for (let i = 0; i < container.children.length; i++) {
        const node = container.children[i] as HTMLDivElement
        const height = node.offsetHeight
        const distance = containerScrollCenter - (scannedHeight + height * 0.5)
        const distanceAbs = Math.abs(distance)
        if (distanceAbs < minDistance) {
          minDistance = distanceAbs
          iMinDistance = i
        }
        scannedHeight += height
      }
      return iMinDistance
    }

    function updateScrolledItemModel(i: number): void {
      let value = optionsOrdered.value[i]
      if (value !== props.modelValue) {
        emit('update:modelValue', value)
      }
    }

    const scrollToItem = (n?: number, behavior?: "auto" | "smooth") => {
      const container = scrollContainer.value
      if (!container) {
        return
      }

      if (n === undefined) {
        n = optionsOrdered.value.indexOf(props.modelValue || '')
      }
      if (n === -1) {
        console.warn("Invalid scroll item target")
        return
      }
      const targetEl = container.children[n] as HTMLButtonElement

      const top = targetEl.offsetTop - container.offsetTop
      const sizeDiff = container.offsetHeight - targetEl.offsetHeight

      container.scrollTo({
        top: top - sizeDiff * 0.5,
        behavior,
      })
    }
    const scrollToDebounced = debounce(scrollToItem, 100)

    function checkScrollCenterElement() {
      const currentScrollIndex = findCenterItemIndex(scrollContainer.value!)
      updateScrolledItemModel(currentScrollIndex)
      scrollToDebounced(undefined, "smooth")
    }

    function compensateRotation(positions: number) {
      const container = scrollContainer.value
      if (!container) {
        return
      }

      const scrollCompensation = Math.sign(positions) * getChildrenTotalHeight(container, positions)
      container.scrollTop += scrollCompensation
    }

    function getChildrenTotalHeight(container: HTMLDivElement, count: number) {
      let yPx = 0
      let i = 0
      const children = container.children as unknown as HTMLDivElement[]
      while (count > 0) {
        yPx += children[i].offsetHeight
        i++
        count--
      }
      while (count < 0) {
        yPx += children[container.children.length - 1 - i].offsetHeight
        i++
        count++
      }

      return yPx
    }

    onMounted(() => {
      const container = scrollContainer.value!
      scrollToItem()
      container.addEventListener('scroll', checkScrollCenterElement)
      checkScrollCenterElement()
    })
    onUnmounted(() => scrollContainer.value?.removeEventListener('scroll', checkScrollCenterElement))

    return {
      scrollContainer,
      optionsOrdered,
    }
  }
})
</script>


<style lang="scss">

.select-scroller {
  flex: 1;

  display: grid;
  grid-template-rows: 1fr;
  gap: 0.1em;
  overflow-y: auto;
  justify-content: stretch;
  min-height: 4em;

  scroll-snap-type: y mandatory;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  .btn {
    //scroll-snap-align: center;
    //scroll-snap-stop: always;

    height: 100%;
  }
}

</style>
