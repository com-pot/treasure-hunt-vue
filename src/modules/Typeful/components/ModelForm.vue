<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { TypefulModel, crawlInputGroups } from '../model/TypefulModel';
import TypefulAutoSection from './TypefulAutoSection';


const props = defineProps({
    model: { type: Object as PropType<TypefulModel>, required: true },
    modelValue: { type: Object, required: true },
    submit: { type: Function },
})

const inputGroups = computed(() => crawlInputGroups(props.model))

function submitForm(e: SubmitEvent) {
    props.submit?.()
}

</script>

<template>
    <form class="app-form"
        @submit.prevent="submitForm"
    >
        <fieldset v-for="group of inputGroups" :key="group.path.join('.')">
            <legend>{{ group.path }}</legend>
            <TypefulAutoSection 
                :inputs="group.inputs"
                :model-value="modelValue"
            />
        </fieldset>

        <div class="controls">
            <button class="btn -fill -sm">Submit</button>
        </div>
    </form>
</template>