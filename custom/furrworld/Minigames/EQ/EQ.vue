<script setup lang="ts">
import { PropType, computed } from 'vue'
import { EQ, EQConfig, EQState } from './eq'
import { exposeMinigameControls, useViewState } from '@src/modules/treasure-hunt/components/minigameData';
import { uniqueId } from 'lodash';
import EQKnob from './EQKnob.vue';

const emit = defineEmits()

const props = defineProps({
    challengeConfig: {type: Object as PropType<EQConfig>, required: true},
})
const channelIndex = computed(() => Object.fromEntries(props.challengeConfig.channels.map((channel) => [channel.name, channel])))

const mgState = useViewState<EQState>(() => {
    const entries = props.challengeConfig.channels.map((channel) => {
        return [channel.name, channel.default ?? channel.range[0]]
    })

    return {
        knobs: Object.fromEntries(entries),
    }
})

const eqUuid = uniqueId('eq-')
const knobIds = computed(() => props.challengeConfig.channels.map((channel) => eqUuid + channel.name))

function clampChannelValue(value: number, channel: EQ.Channel) {
    const range = channel.range[1] - channel.range[0] + 1
    while (value < channel.range[0]) value = value + range
    while (value > channel.range[1]) value = value - range
    return value
}
function setValue(name: string, value: number) {
    const dValue = value - mgState.value.knobs[name]
    mgState.value.knobs[name] = value
    
    props.challengeConfig.bindings[name]?.forEach((sideEffect) => {
        const [secondaryName, secondaryConst] = sideEffect
        const channel = channelIndex.value[secondaryName]
        const currentValue = mgState.value.knobs[secondaryName]
        const newValue = clampChannelValue(currentValue + dValue * secondaryConst, channel)
        mgState.value.knobs[secondaryName] = newValue
    })
}

exposeMinigameControls({
    getValue: () => Object.entries(mgState.value.knobs),
    reset: () => mgState.reset(),
}, emit)


</script>

<template>
    <div class="mg -eq">
        <div class="knobs">
            <template v-for="(knob, iKnob) of challengeConfig.channels" :key="knob.name">
                <EQKnob
                    :name="knob.name" :id="knobIds[iKnob]"
                    :data-name="knob.name"
                    :appearance="knob.appearance || challengeConfig.appearance"

                    :min="knob.range[0]" :max="knob.range[1]" :step="knob.step ?? 1"


                    :model-value="mgState.value.knobs[knob.name]"
                    @update:model-value="setValue(knob.name, $event)"
                />
                <div class="label">{{ mgState.value.knobs[knob.name] }}</div>
                <div class="caption">{{ knob.label }}</div>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
.mg.-eq {
    .knobs {
        display: grid;
        grid-template-rows: 10rem auto auto;
        grid-auto-flow: column;
        gap: 0.5rem 1rem;
        
        place-content: start;
        place-items: stretch center;

        .caption {
            width: min-content;
        }

        .eq-knob {
            width: 2rem;
        }
    }

    

    input[type="range"] {
        width: 1rem;
        accent-color: deeppink;
    }
}
</style>