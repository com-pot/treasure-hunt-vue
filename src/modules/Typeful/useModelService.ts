import {get, merge} from 'lodash';

import AsyncRegistry from "@src/modules/Typeful/AsyncRegistry"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import {InputSpec} from "@src/modules/Typeful/types/InputSpec"
import JsonApiAdapter, {SearchParams} from "@src/modules/Api/services/JsonApiAdapter"
import {stringify, StringifySpec} from "@src/modules/Typeful/model/stringify"


const modelRegistry = new AsyncRegistry<TypefulModel>()

export default function useModelService<TEntity extends {} = any>(api: JsonApiAdapter): ModelService<TEntity> {
    const typeRegistry = useTypeRegistry()

    const fetchModel = (name: string) => api.get<TypefulModel>('/backstage/typeful/model/' + name)

    let modelService: ModelService<any> = {
        preload: async (...models) => modelRegistry.ensureLoaded(models, fetchModel).then(() => {}),

        async createModelItem(fullName, defaults) {
            const model = await modelService.getModelAsync(fullName)
            let value = typeRegistry.getDefaultValue(model.schema)

            return merge(value, defaults)
        },

        async saveNewItem(fullName: string, modelItem) {
            let model = await this.getModelAsync(fullName)
            return api.post('/backstage' + model.endpoints.entityAny, modelItem)
        },
        async loadModelItem(fullName, pkValue, filter) {
            const model = await this.getModelAsync(fullName)
            const query = createQueryObj(filter)

            return api.get('/backstage' + model.endpoints.entityExact.replace(':id', '' + pkValue), query)
        },
        async updateItem(fullName: string, modelItem) {
            let model = await this.getModelAsync(fullName)
            const pkValue = get(modelItem, model.primaryKey)
            if (!pkValue) {
                return Promise.reject('no-pk-value')
            }

            return api.put('/backstage' + model.endpoints.entityExact.replace(':id', '' + pkValue), modelItem)
        },

        async loadCollection(fullName, modelQuery) {
            const model = await this.getModelAsync(fullName)
            const response = await api.makeRequest<any[]>('get', '/backstage' + model.endpoints.collection, undefined, createQueryObjFromModelQuery(modelQuery))

            return {
                items: await api.responseToJson(response),
                pagination: inferPaginationFromHeaders(response.headers),
            }
        },

        getModel: (fullName) => {
            let status = modelRegistry.getStatus(fullName)
            if (status !== 'ready') {
                throw new Error(`Model '${fullName}' not ready (${status})`)
            }

            return modelRegistry.getValue(fullName)!
        },

        getModelAsync(fullName) {
            return modelRegistry.ensureLoaded(fullName, fetchModel)
        },
    }

    return modelService
}

export type TypefulModel = {
    endpoints: {
        collection: string,
        entityAny: string,
        entityExact: string,
    },
    schema: ModelSchema,
    primaryKey: string,
    stringify?: StringifySpec,
}
type ModelSchema = InputSpec & { type: 'object' }

export type ModelServiceQueryTypes = {
    filter: string | SearchParams,
    sort: never,
    pagination: Partial<{ page: number, perPage: number }>,
}
export type CollectionPagination = Required<ModelServiceQueryTypes['pagination']> & {totalItems: number}

type ModelService<TValue extends {}> = {
    preload(...models: string[]): Promise<void>,

    createModelItem(fullName: string, defaults?: Partial<TValue>): Promise<TValue>,

    saveNewItem(fullName: string, modelItem: TValue): Promise<TValue>,
    loadModelItem(fullName: string, pkValue: any, filter?: ModelServiceQueryTypes['filter']): Promise<TValue>,
    updateItem(fullName: string, item: TValue): Promise<TValue>,

    loadCollection(fullName: string, query?: Partial<ModelServiceQueryTypes>): Promise<{items: TValue[], pagination: CollectionPagination}>,

    getModel(fullName: string): TypefulModel,

    getModelAsync(fullName: string): Promise<TypefulModel>,
}
export function stringifyModelItem(model: TypefulModel, item: any) {
    if (!model.stringify) {
        console.warn("Unspecified stringify on model", model)
        return '---'
    }
    return stringify(item, model.stringify)
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

function inferPaginationFromHeaders(headers: Headers): CollectionPagination {
    const parseNum = (name: string): number => Number(headers.get(name))
    return {
        page: parseNum('coll-page'),
        perPage: parseNum('coll-per-page'),
        totalItems: parseNum('coll-total'),
    }
}
