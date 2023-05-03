<script lang="ts" setup>
import { PropType } from "vue"
import { NavigationItem, navItemIsLink } from "../navigation/NavigationModel"

const props = defineProps({
    items: { type: Array as PropType<any[]>, required: true },
})



function getActiveClass(item: NavigationItem, mode?: 'exact'): string | undefined {
    const exactMatch = mode === 'exact'

    if (navItemIsLink(item) && (!!item.exact) === exactMatch) {
        return '-acc-primary'
    }
}
</script>

<template>
    <div class="nav-list">
        <template v-for="item in items">
            <div role="separator" v-if="item.type === 'separator'" />

            <router-link v-else :to="item.to" class="btn" :active-class="getActiveClass(item)"
                :exact-active-class="getActiveClass(item, 'exact')">{{ item.caption }}</router-link>
        </template>
    </div>
</template>
  
  
  
<style lang="scss">
.nav-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    overflow-y: auto;

    [role="separator"] {
        inline-size: 69%;
    }
}
</style>