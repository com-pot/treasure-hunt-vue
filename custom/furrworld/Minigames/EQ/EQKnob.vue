<script setup lang="ts">
import { useFavicon, useVibrate } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useDragging, getNormalizedPointOfEl, MouseEventNormalized } from '@src/modules/treasure-hunt/components/dragging';
import { clamp } from 'lodash';

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    min: {type: Number, default: 0},
    max: {type: Number, default: 100},
    step: {type: Number, default: 1},

    name: {type: String},
    id: {type: String},
    appearance: {type: String, default: 'raw'},

    label: {type: String},

    modelValue: {type: Number},

    feedback: {type: String, default: 'vibrate'},
})

const v = useVibrate()

const iv = computed({
    get: () => props.modelValue || 0,
    set: (value) => {
        if (value === iv.value) return

        emit('update:modelValue', value)
        if (props.feedback === 'vibrate') {
            v.vibrate(1)
        }
    },
})

const knobSteps = computed(
    () => Array.from({length: props.max - props.min + 1})
        .map((_, i) => i + props.min)
        .reverse()
)

function propagateDrag(e: MouseEventNormalized) {
    const targetEl = e.original.target as HTMLElement
    const knobEl = targetEl.closest('[data-name]') as HTMLElement
    if (!knobEl || knobEl.dataset['appearance'] !== 'col') {
        return false
    }
    

    const value = targetEl.closest('label') ? Math.round((1 - e.y) * (props.max - props.min) + props.min) : props.min
    iv.value = clamp(value, props.min, props.max)

    return true
}

const knobEl = ref<HTMLDivElement>()

useDragging(knobEl, {
    moveThrottle: 50,
    normalizePoint: (el, e) => {
        const target = e.target instanceof HTMLElement && e.target.closest('.visualizer') as HTMLElement
        
        return getNormalizedPointOfEl(target || el, e)
    },

    start: (e) => propagateDrag(e),
    move: (e, ctx) => ctx.isHeld && propagateDrag(e),
})

</script>

<template>
    <div class="eq-knob" :data-appearance="appearance" ref="knobEl">
        <input type="range" orient="vertical" :id="id"
            :min="min" :max="max" :step="step"
            v-model.number="iv"
        >
        <label :for="id" class="visualizer" role="presentation">
            <div  v-for="step of knobSteps" :key="step"
                class="step" :data-value="step"
                :aria-selected="step <= iv || undefined"
                :aria-current="step === iv ? 'step' : undefined"
            />
        </label>
    </div>
</template>

<style lang="scss">
.eq-knob {
    display: grid;
    grid-auto-flow: row;
    place-items: center;
    
    align-items: center;
    text-align: center;

    .visualizer {
        display: none;
    }

    &[data-appearance="col"] {
        input[type="range"], .visualizer {
            grid-area:  1/1;
        }
        
        .visualizer {
            place-self: stretch;
        }
        input[type="range"] {
            opacity: 0;
            pointer-events: none;
        }

        &:focus-within {
            .visualizer {
                outline: 2px solid;
                outline-offset: 2px;
            }
        }

        .visualizer {
            display: grid;
            grid-auto-rows: auto;
            place-items: stretch center;
            
            gap: 1px;

            .step {
                background-color: gray;
                flex: 1;
                width: 25%;

                transition: width 0.1s ease-in-out, background-color 0.1s ease-in-out;

                &[aria-selected] {
                    width: 80%;
                    background-color: pink;
                }
                &[aria-current="step"] {
                    width: 100%;
                    background-color: deeppink;
                    border-radius: 4px;
                }
            }
        }
    }

}
</style>