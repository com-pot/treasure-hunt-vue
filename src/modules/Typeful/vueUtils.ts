import createModelService, { ModelService } from "./modelService";
import JsonApiAdapter from "../Api/services/JsonApiAdapter";
import useAsyncIndicator from "../Layout/mixins/useAsyncIndicator";
import { AwaitableAsyncValueRef } from "./types/asyncUtils";
import { TypefulModel } from "./model/TypefulModel";
import { reactive, toRef } from "vue";

const modelServices = new WeakMap()
export function useModelService(api: JsonApiAdapter) {
    if (!modelServices.has(api)) {
        modelServices.set(api, createModelService(api))
    }
    return modelServices.get(api) as ModelService
}


export function getAsyncModelFn(modelService: ReturnType<typeof useModelService>, modelName: string): AwaitableAsyncValueRef<TypefulModel> {
    const status = useAsyncIndicator('uninitialized')
    let modelAsync: AwaitableAsyncValueRef<TypefulModel>|null = null

    modelAsync = reactive({
        status: toRef(status, 'status'),
        value: null,
        ready: () => modelService.getModelAsync(modelName),
    })
    status.awaitTask(modelAsync.ready)
        .then((model) => modelAsync!.value = model)

    return modelAsync
}
