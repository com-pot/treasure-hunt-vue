<script lang="ts" setup>

const props = defineProps({
    model: {type: Object, required: true},
})

</script>

<template>
    <pre class="code model-info">{{ model }}</pre>
</template>
