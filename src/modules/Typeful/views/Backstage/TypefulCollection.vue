<script lang="ts" setup>
import { useApiAdapter } from '@src/modules/treasure-hunt/services';
import { computed, onMounted, ref, toRef } from 'vue';
import { useAsyncState, watchArray } from '@vueuse/core';
import Pagination from '../../components/Pagination.vue';
import { PaginatedList } from '../../model/list';
import { useRouteAccessor } from "../../components/routeAccessor";
import { useModelService } from '../../vueUtils';
import { TypefulModel } from '../../model/TypefulModel';
import { useRenderer } from "../../renderer"
import { stringifyModelItem } from '../../modelService';
import { useAlert, useDialogController, useToast } from '@src/modules/Layout/components/viewUtils';
import ModelForm from '../../components/ModelForm.vue';
import { resolveAfter } from '@src/utils/promiseUtils';
import { useTypeRegistry } from '../../typeRegistry';
import { get } from 'lodash';
import {printErrorsToHtml} from "@src/utils/errors"

const props = defineProps({
    id: { type: String, required: true },
})

const ra = useRouteAccessor({ pageParamName: "page" })
const api = useApiAdapter()
const modelService = useModelService(api)
const typeRegistry = useTypeRegistry()
const r = useRenderer()
const dialogCtrl = useDialogController()
const toast = useToast()


const id = toRef(props, "id")
const collection = useAsyncState(() => api.get<{entity: TypefulModel}>(`/backstage/typeful/collection/${id.value}`), null, {immediate: false})
const model = computed(() => {
    const spec = collection.state.value?.entity

    return {
        spec,
        stringify: (item: any) => stringifyModelItem(spec, item)
    }
})
const items = useAsyncState(() => api.get<PaginatedList<any>>(`/backstage/typeful/collection/${id.value}/items`, {
    _page: ra.page.value,
}), null)
watchArray([ra.page], () => items.execute())

const workingCopy = ref()
async function editItem(item: any) {
    workingCopy.value = item || typeRegistry.getDefaultValue(model.value.spec.schema)
    const id = get(workingCopy.value, model.value.spec.primaryKey)

    const dialog = dialogCtrl.showDialog({
        is: ModelForm,
        props: {
            model: model.value.spec,
            modelValue: workingCopy.value,
            async submit() {
                console.log("submit", id, workingCopy.value)

                const resultPromise = id 
                    ? modelService.updateItem(model.value.spec.meta.entityFqn, workingCopy.value)
                    : modelService.saveNewItem(model.value.spec.meta.entityFqn, workingCopy.value)
                
                try {
                    const result = await resultPromise
                    console.log(result)
                    toast.success("Záznam uložen")
                    dialog.controls.confirm(result)
                } catch (e) {
                    const toastText = printErrorsToHtml(e)
                    toast.error('', {title: 'Uložení selhalo', timer: 2000, html: toastText})

                    throw e
                }
            },
        },
    }, {
        rejectOnAbort: false,
    })

    console.log("dialog", dialog)
    const result = await dialog.result
    console.log("result", dialog.id, result)
}

onMounted(async () => {
    const c = await collection.execute()
    workingCopy.value = await modelService.createModelItem(c.entity.meta.entityFqn)
})

</script>

<template>
    <div class="content">
        <div class="section-heading">
            <h1>Collection '{{ id }}'</h1>
            <hr>
            <div class="actions">
                <button class="btn -xs" @click="editItem(null)">add</button>
            </div>
        </div>

        <template v-if="items.isLoading.value">
            loading...
        </template>
        <template v-else-if="items.error.value || !items.state.value">
            error
        </template>
        <template v-else>
            <div class="list">
                <template v-for="item of items.state.value.items">
                    <div class="tile">
                        <div class="tile-body row">
                            <div class="name">{{ model.stringify(item) }}</div>
                            <div class="stats">
                                <span>c: {{ r.date(item.stats.createdAt) }} {{ r.time(item.stats.createdAt) }}</span>
                                <br/>
                                <span>m: {{ r.date(item.stats.editedAt) }} {{ r.time(item.stats.editedAt) }}</span>
                            </div>
                            <div class="actions">
                                <button class="btn -xs" @click="editItem(item)">edit</button>
                            </div>
                        </div>
                        <!-- <div class="tile-body">
                            {{ item }}
                        </div> -->
                    </div>
                </template>
            </div>
            <Pagination
                :pagination="items.state.value"
                :model-value="ra.page.value"
                :mk-link="ra.withPage"
            />
        </template>
    </div>
</template>
