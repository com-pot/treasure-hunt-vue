import {get, merge} from 'lodash';

import AsyncRegistry from "@src/modules/Typeful/AsyncRegistry"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import JsonApiAdapter, {SearchParams} from "@src/modules/Api/services/JsonApiAdapter"
import {stringify} from "@src/modules/Typeful/model/stringify"
import { ModelServiceQueryTypes, TypefulModel } from './model/TypefulModel';
import { PaginatedList } from './model/list';

export default function createModelService(api: JsonApiAdapter): ModelService {
    const modelRegistry = new AsyncRegistry<TypefulModel>()
    const typeRegistry = useTypeRegistry()

    const fetchModel = (name: string) => api.get<TypefulModel>('/backstage/typeful/model/' + encodeURIComponent(name))

    let modelService: ModelService = {
        preload: async (...models) => modelRegistry.ensureLoaded(models, fetchModel).then(() => {}),

        async createModelItem(modelId, defaults) {
            const model = await modelService.getModelAsync(modelId)
            let value = typeRegistry.getDefaultValue(model.schema)

            return merge(value, defaults)
        },

        async saveNewItem(modelId: string, modelItem) {
            let model = await this.getModelAsync(modelId)
            return api.post('/backstage' + model.endpoints.entityAny, modelItem)
        },
        async loadModelItem(modelId, pkValue, filter) {
            const model = await this.getModelAsync(modelId)
            const query = createQueryObj(filter)

            return api.get('/backstage' + model.endpoints.entityExact.replace(':id', '' + pkValue), query)
        },
        async updateItem(modelId: string, modelItem) {
            let model = await this.getModelAsync(modelId)
            const pkValue = get(modelItem, model.primaryKey)
            if (!pkValue) {
                return Promise.reject('no-pk-value')
            }

            return api.put('/backstage' + model.endpoints.entityExact.replace(':id', '' + pkValue), modelItem)
        },

        async loadCollection(modelId, modelQuery) {
            const model = await this.getModelAsync(modelId)
            const response = await api.makeRequest<any[]>('get', '/backstage' + model.endpoints.collection, undefined, createQueryObjFromModelQuery(modelQuery))

            return api.responseToJson(response)
        },

        getModel: (modelId) => {
            let status = modelRegistry.getStatus(modelId)
            if (status !== 'ready') {
                throw new Error(`Model '${modelId}' not ready (${status})`)
            }

            return modelRegistry.getValue(modelId)!
        },

        getModelAsync(modelId) {
            return modelRegistry.ensureLoaded(modelId, fetchModel)
        },
    }

    return modelService
}

export type ModelService = {
    preload(...models: string[]): Promise<void>,

    createModelItem<TValue extends {}>(modelId: string, defaults?: Partial<TValue>): Promise<TValue>,

    saveNewItem<TValue extends {}>(modelId: string, modelItem: TValue): Promise<TValue>,
    loadModelItem<TValue extends {}>(modelId: string, pkValue: any, filter?: ModelServiceQueryTypes['filter']): Promise<TValue>,
    updateItem<TValue extends {}>(modelId: string, item: TValue): Promise<TValue>,

    // TODO: Check usages
    loadCollection<TValue extends {}>(modelId: string, query?: Partial<ModelServiceQueryTypes>): Promise<PaginatedList<TValue>>,

    getModel(modelId: string): TypefulModel,
    getModelAsync(modelId: string): Promise<TypefulModel>,
}
export function stringifyModelItem(model: TypefulModel, item: any) {
    if (!model) return "---"
    let str = model?.stringify
    if (!str) {
        str = model.primaryKey
    }

    return stringify(item, str)
}


function createQueryObjFromModelQuery(modelQuery?: Partial<ModelServiceQueryTypes>): SearchParams|undefined {
    if (!modelQuery) {
        return
    }
    const query = createQueryObj(modelQuery.filter)
    if (modelQuery.pagination) {
        query._page = modelQuery.pagination.page
        query._perPage = modelQuery.pagination.perPage
    }
    return query
}
function createQueryObj(filter?: ModelServiceQueryTypes['filter']): SearchParams {
    if (!filter) {
        return {}
    }

    return typeof filter === 'string' ? {_find: filter} : {...filter}
}
