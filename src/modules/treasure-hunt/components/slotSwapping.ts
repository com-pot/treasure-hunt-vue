import {reactive, computed, ComputedRef} from "vue";

type ItemGroup<T> = { [group: string]: T[] }

type GroupSwappingObj<T, G extends ItemGroup<T>> = {
    selectedGroup: string | null,
    selectedIndex: number | null,
    pickItem(group: keyof G, i: number): void,
    canPickItem(item: T): boolean,
    swapItems: (item1: T, item2: T) => boolean,
    onSwap?: (item1: T, item2: T) => void,
}

export function twoPartyMultiGroupSwapping<T, G extends ItemGroup<T>>(groups: G) {
    const swapping: GroupSwappingObj<T, G> = reactive<GroupSwappingObj<T, G>>({
        selectedGroup: null,
        selectedIndex: null,
        pickItem(groupName, i) {
            if (!(groupName in groups)) {
                console.warn(`Group '${groupName.toString()} is not valid'`)
                return
            }

            if (this.selectedGroup === groupName && this.selectedIndex === i) {
                this.selectedGroup = this.selectedIndex = null
                return
            }

            const targetItem = groups[groupName][i]
            if (!this.canPickItem(targetItem)) {
                return
            }
            if (this.selectedGroup === null || this.selectedIndex === null) {
                this.selectedGroup = groupName as any
                this.selectedIndex = i
                return
            }

            const selectedItem = groups[this.selectedGroup!][this.selectedIndex!]
            this.onSwap?.(selectedItem, targetItem)
            if (this.swapItems(selectedItem, targetItem)) {
                groups[this.selectedGroup!][this.selectedIndex!] = targetItem
                groups[groupName][i] = selectedItem
            }
            this.selectedGroup = this.selectedIndex = null
        },
        canPickItem: () => true,
        swapItems: () => true,
    })

    return swapping
}
