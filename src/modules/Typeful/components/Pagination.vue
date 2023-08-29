<script lang="ts" setup>
import { PropType } from 'vue';
import { ResultPagination } from '../model/list';
import { computed } from 'vue';

const emit = defineEmits({
    'update:modelValue': (value: number) => value >= 1,
})
const props = defineProps({
    modelValue: {type: Number, required: true},
    pagination: {type: Object as PropType<ResultPagination>, required: true},
    current: {type: String as PropType<'page'>, default: 'page'},

    mkLink: {type: Function},
    linkMode: {type: String as PropType<'push' | 'replace'>, default: 'replace'},
    displayRange: {type: Boolean},
})

const maxPage = computed(() => {
    let pages = props.pagination.totalPages ?? -1
    if ((typeof pages !== "number" || pages < 1) && "totalItems" in props.pagination) {
        pages = Math.ceil(props.pagination.totalItems / props.pagination.perPage)
    }
    if (pages <= 1) return 1
    
    return Math.round(pages)
})

const buttons = computed(() => {
    let min = Math.max(1, props.modelValue - 2)
    let max = Math.min(props.modelValue + 2, maxPage.value)

    const pages: ({page: number, label?: undefined} | {page: undefined, label: string})[] = []
    if (min > 2) {
        pages.unshift({page: undefined, label: '...'})
    }
    if (min > 1) {
        pages.unshift({page: 1})
    }
    for (let i = min; i <= max; i++) {
        pages.push({page: i})
    }
    if (max < maxPage.value - 1) {
        pages.push({page: undefined, label: '...'})
    }
    if (max < maxPage.value) {
        pages.push({page: maxPage.value})
    }

    return pages
})

const displaying = computed(() => {
    if ("perPage" in props.pagination) {
        const from = (props.modelValue - 1) * props.pagination.perPage
        return {
            from: from + 1,
            to: Math.min(from + props.pagination.perPage, props.pagination.totalItems)
        }
    }

    return null
})

function setPage(page: number) {
    emit('update:modelValue', page)
}

</script>

<template>
    <div class="pagination">
        <nav v-if="mkLink">
            <template v-for="button of buttons" :key="button.page">
                <router-link class="btn" :to="mkLink(button.page)"
                    :aria-current="button.page === modelValue && current || undefined"
                    :role="!button.page ? 'presentation' : undefined"
                >{{ button.page ?? button.label}}</router-link>
            </template>
            
        </nav>
        <nav v-else>
            <template v-for="button of buttons" :key="button.page">
                <button class="btn"
                    :aria-current="button.page === modelValue && current || undefined"
                    :role="!button.page ? 'presentation' : undefined"
                    @click="button.page && setPage(button.page)">{{ button.page ?? button.label }}</button>
            </template>
        </nav>
        <div class="range" v-if="displayRange && displaying">{{ displaying.from }} - {{ displaying.to }}</div>
    </div>
</template>

<style lang="scss">
.pagination {
    display: flex; flex-direction: column;

    justify-content: center;
    align-items: center;
    gap: 1rem 4rem;

    nav {
        display: flex;

        .btn {
            width: 4ch;
            height: 4ch;
            display: grid;
            place-content: center;

            padding: 0.25em;
            line-height: 1;

            background-color: var(--color-bg);

            &[aria-current] {
                border-color: var(--hsl-primary);
                background-color: hsl(var(--hsl-primary-components) / 0.1);

            }
        }

        [role="presentation"] {
            pointer-events: none;
        }
    }
}
</style>
