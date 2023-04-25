<script lang="ts" setup>
import { PropType, computed, ref } from 'vue';
import { useViewState, minigameEmits } from '@src/modules/treasure-hunt/components/minigameData';
import TypefulInput from '@src/modules/Typeful/components/TypefulInput';
import { MinigameConfig, CkSequenceState } from './cqSequence';

const emit = defineEmits({
    ...minigameEmits,
})
const props = defineProps({
    challengeConfig: {type: Object as PropType<MinigameConfig>, required: true},
})

const state = useViewState<CkSequenceState>(() => {
    return {
        sequence: props.challengeConfig.colorSquence.options[0].value,
        code: ' '.repeat(props.challengeConfig.code.length),
    }
})

const activeSequence = computed(() => {
    const options = props.challengeConfig.colorSquence.options
    const s = options.find((option) => option.value === state.value.sequence)

    return s
})
const indexes = computed(() => Array.from({length: props.challengeConfig.code.length}).map((_, i) => i))

const code = {
    getAt: (i: number) => {
        const c = state.value.code.at(i)
        return c?.trim() || ''
    },
    setAt: (i: number, c: string) => {
        const code = state.value.code
        state.value.code = code.substring(0, i) + (c.substring(0, 1) || ' ') + code.substring(i + 1)
        focusCodeInput(i + (c ? 1 : -1))
    },
}

const colorToHsl = {
    r: '6 92% 37%',
    g: '97 92% 37%',
    b: '245 92% 37%',
    k: '0 0% 0%',
}

const getHslStyle = (i: number): string => {
    const key = activeSequence.value?.sequence.charAt(i)
    const hsl = key && colorToHsl[key]

    if (hsl) return `--hsl: ${hsl};`

    return ''
}

const codeArrayEl = ref<HTMLDivElement>()
const focusCodeInput = async (i: number) => {
    const inputs = codeArrayEl.value?.querySelectorAll('input')
    const input = inputs?.item(i)

    if (!input) return

    const {activeElement} = window.document
    if (activeElement && codeArrayEl?.value?.contains(activeElement)) {
        if (activeElement instanceof HTMLElement) {
            activeElement.blur()
        }
    }

    input.focus()
    input.setSelectionRange?.(0, input.value.length)
}
function handleInput(i: number, e: Event) {
    const target = e.target
    if (target instanceof HTMLInputElement) {
        code.setAt(i, target.value)
    }
}

</script>

<template>
    <div class="mg -ck-sequence">
        <div class="panel">
            <div class="sequence-picker">
                <TypefulInput 
                    type="select" :options="challengeConfig.colorSquence.options"
                    v-model="state.value.sequence"
                    :can-clear="false"
                />
            </div>
            <button class="btn -sm reset" @click="() => state.reset()">Zrušit</button>

            
            <div class="code-array" ref="codeArrayEl">
                <template v-for="i of indexes" :key="i">
                    <div class="cell" :class="!!code.getAt(i) && '-has-value'"
                        :style="getHslStyle(i)"
                    >
                        <TypefulInput type="text" inputmode="numeric" pattern="\d"
                            :model-value="code.getAt(i)"
                            
                            @input="handleInput(i, $event)"
                        />
                    </div>
                </template>
            </div>

            <div class="controls">
                <button class="btn" @click="emit('check-solution', state.value)">Ověřit kód</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.mg.-ck-sequence {
    .panel {
        display: grid;
        gap: 0.5rem;

        background: hsl(var(--hsl-light) / 0.5);
        padding: 0.5rem;

        .reset {
            place-self: start end;
        }

        .code-array, {
            grid-column: span 2;
            place-self: stretch;
        }


        .controls {
            grid-column: span 2;
            place-self: center;
        }
    }
    .code-array {
        display: flex;
        justify-content: center;
        gap: 0.1rem;
        --input-width: 2ch;

        .panel {
            display: grid;
            grid-template-columns: auto auto;
        }

        .cell {
            flex: 1;
            --hsl: 0 0% 100%;
            min-width: calc(var(--input-width) + 0.5em);
            max-width: calc(var(--input-width) + 2em);
            height: 6ch;

            display: grid;
            place-content: stretch;

            > *, &::after {
                grid-area: 1 / 1;
            }

            &::after {
                content: '';
                display: block;
                width: 100%;
                height: 100%;

                background-color: hsl(var(--hsl));
                place-self: stretch;

                z-index: 1;
            }
            input {
                z-index: 2;
                place-self: center;
            }
        }

        input {
            min-width: 0;
            width: var(--input-width);
            padding: 0.25em 0.1em;
            text-align: center;
        }
    }
}
</style>
