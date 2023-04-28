<script lang="ts" setup>
import { PropType, computed, h, inject, onMounted, ref } from "vue";
import { round } from "lodash";
import ClueCamera from "../../components/ClueCamera.vue";
import { ActivityConfig } from "./fieldActivity"
import useCurrentTime from "../../components/useCurrentTime";
import { minigameEmits } from "../../components/minigameData";
import { useApiAdapter } from "../../services";
import { usePlayerBag, usePlayerProgression } from "../../model/playerProgression";
import { RevealedClue, useClueInstance } from "../../model/Clue";
import { shuffleFisherYates } from "@src/utils/arrays";

const emit = defineEmits({
    ...minigameEmits,
})
const props = defineProps({
    challengeConfig: {type: Object as PropType<ActivityConfig>, required: true},
})

const api = useApiAdapter()
const playerBag = usePlayerBag(api)
const clue = useClueInstance<RevealedClue>(api)
const playerProgression = usePlayerProgression('optional') || {
    reload() {
        console.log("Reload player progression");
    },
}
const updateViewState = inject('update-view-state') as () => Promise<unknown>


const latestScanned = ref('')
const dateStarted = ref(0)
const dateEnded = ref(0)

type ActivityStatus = "pending" | "ok" | "err"
const status = ref<ActivityStatus>('pending')
const counter = ref(0)
const sequence = ref(0)

const debugView = (() => {
    let state = ref(false)

    let counter = 0
    let timeout: ReturnType<typeof setTimeout> | null = null
    function resetCounter() {
        counter = 0
        timeout = null
        console.log('resetCounter')
    }

    return {
        state,
        hit() {
            console.log('hit', counter)
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            counter++
            if (counter < 5) {
                timeout = setTimeout(resetCounter, 500)
                return
            }
            state.value = true
        }
    }
})()


const time = useCurrentTime({
    interval: 100,
    format(d) {
        if (!dateStarted.value) return '---'
        const ms = (dateEnded.value || d.getTime()) - dateStarted.value

        return round(ms / 1000).toString().padStart(3, '0')
    },
})

type FieldACtivityController = {
    testClue: (clue: string) => ActivityStatus | undefined | void | Promise<ActivityStatus | undefined | void>,
    render: () => any,

    init?: () => Promise<unknown>,
}
const clueController = computed((): FieldACtivityController => {
    const c = props.challengeConfig
    if (c?.type === 'sprint') {
        return {
            testClue(clue) {
                const clueIndex = c.checkPoints.findIndex((cp) => cp.clue === clue)
                if (clueIndex === 0) {
                    dateStarted.value = Date.now()
                    dateEnded.value = 0
                    return 'pending'
                }
                if (clueIndex !== c.checkPoints.length -1) {
                    return
                }

                dateEnded.value = Date.now()
                const totalTimeTaken = dateEnded.value - dateStarted.value
                return totalTimeTaken < c.timeLimit * 1_000 ? 'ok' : 'err'
            },
            render() {
                return h('div', {class: 'text'}, [time.formatted])
            },
        }
    }

    if (c?.type === 'repeat') {
        return {
            testClue(clue) {
                const nextClue = c.repeatClues[sequence.value]
                if (!nextClue || nextClue.clue !== clue) return

                sequence.value = sequence.value + 1
                if (sequence.value < c.repeatClues.length) {
                    return
                }
                sequence.value = 0
                counter.value = counter.value + 1

                if (counter.value < c.count) {
                    return 
                }

                return 'ok'
            },
            render() {
                let sequenceIndicators = []
                for (let i = 0; i < c.repeatClues.length; i++) {
                    sequenceIndicators.push(h('div', {class: ['seq', i === sequence.value && 'active']}))
                }
                return h('div', {class: 'text'}, [
                    h('div', {class: 'seq-progress'}, sequenceIndicators),
                    h('span', `${counter.value} / ${c.count}`),
                ])
            },
        }
    }

    if (c?.type === 'collect-all') {
        return {
            init: () => playerBag.load(c.list.map((entry) => entry.item)),
            async testClue(clueStr) {
                await clue.reveal(clueStr)
                await updateViewState()
                await this.init()
            },

            render() {
                const items = c.list.map((item) => {
                    return h('li', [
                        h('span', {class: 'status'}, playerBag.hasItem(item.item) ? '✔️' : '❔'),
                        h('span', {class: 'label'}, item.label)
                    ])
                })

                return h('ul', {class: 'collect-items -all'}, items)
            },
        }
    }

    if (c?.type === 'collect-some') {
        const localRequiredItems = _getLocalRequiredItems(c.list.map((entry) => entry.item), 'hack.field-activity.requiredItems')
            .slice(0, c.n)

        return {
            init: () => playerBag.load(c.list.map((entry) => entry.item)),
            async testClue(clueStr) {
                await clue.reveal(clueStr)
                await updateViewState()
                await this.init()

                const foundItemsCount = localRequiredItems
                    .filter((item) => playerBag.hasItem(item))
                    .length

                if (foundItemsCount >= c.n) {
                    emit('check-solution', 'ok')
                }
            },

            render() {
                let foundRequired = 0

                let list = c.list
                if (debugView.state.value) {
                    list = list.filter((item) => localRequiredItems.includes(item.item))
                }

                const itemNodes = list.map((item) => {
                    const isRequired = localRequiredItems.includes(item.item)
                    const isAcquired = playerBag.hasItem(item.item)

                    const foundSymbol = isRequired ? '✔️' : '✖️'
                    if (isRequired && isAcquired) foundRequired++

                    return h('li', [
                        h('span', {class: 'status'}, isAcquired ? foundSymbol : '❔'),
                        h('span', {class: 'label'}, item.label)
                    ])
                })

                return [
                    h('ul', {class: 'collect-items -all'}, itemNodes),
                    h('span', {
                        onClick: () => {debugView.hit()}
                    }, [`${foundRequired} / ${c.n}`]),
                ]
            },
        }
    }
    
    return {
        async testClue(clueStr) {
            await clue.reveal(clueStr)
            await playerProgression.reload()
        },
        render() {
            return ''
        },
    }
})

async function testClue(clue: string) {
    const c = props.challengeConfig
    const prevScanned = latestScanned.value
    latestScanned.value = clue

    const res = await clueController.value.testClue(clue)
    if (res) status.value = res
    res === 'ok' && emit('check-solution', status.value)
}

function parseItems(str: string): string[] | null {
    if (!str) {
        return null
    }
    try {
        const value = JSON.parse(str)
        if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'string')) {
            return null
        }
        return value
    } catch (e) {
        console.error(e)
    }

    return null
    
}
function _getLocalRequiredItems(items: string[], storageKey: string) {
    let localRequiredItems = parseItems(localStorage.getItem(storageKey))

    let shouldGenerate = !Array.isArray(localRequiredItems)
        || !!localRequiredItems.find((localItem) => !items.includes(localItem))
        || !!items.find((item) => !localRequiredItems.includes(item))
    
    if (shouldGenerate) {
        localRequiredItems = shuffleFisherYates(items.slice())
        localStorage.setItem(storageKey, JSON.stringify(localRequiredItems))
    }

    return localRequiredItems
}

onMounted(async () => {
    await clueController.value.init?.()
})

</script>

<template>
    <div class="mg -field-activity">
        <div class="activity-ui">
            <component :is="() => clueController.render()"></component>
        </div>
        <ClueCamera fallback-form @clue-found="testClue"/>
    </div>
</template>
  
  
  <style lang="scss">
  .activity-ui {

    &[data-mode="live"] {
      display: flex;
      justify-content: center;
    }

    > div.text {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
    > .text {
        font-size: 2rem;
        text-align: center;
    }

    .seq-progress {
        .seq {
            width: 0.5em;
            height: 0.5em;
            background: var(--neutral-400);

            &.active {
                background: var(--hsl-primary);
            }
        }
    }

    .collect-items {
        margin: 0;
        padding: 0;

        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15ch, 1fr));
        gap: 0.25rem 1rem;
        padding: 0.25rem 0.5rem 0;

        background-color: white;

        li {
            list-style: none;
            background-color: var(--neutral-950);
        }
    }
  }
  </style>
  