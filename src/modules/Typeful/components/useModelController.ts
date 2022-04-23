import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import {AsyncValueRef, AwaitableAsyncValueRef} from "@src/modules/Typeful/types/asyncUtils"

import useModelService, {
    CollectionPagination,
    ModelServiceQueryTypes, stringifyModelItem,
    TypefulModel,
} from "@src/modules/Typeful/useModelService"
import {reactive, ref, toRef} from "vue"
import JsonApiAdapter from "@src/modules/Api/services/JsonApiAdapter"
import {set, get} from "lodash"


type ModelInstanceController<TValue> = AsyncValueRef<TValue> & {
    create(defaults?: Partial<TValue>): Promise<void>,
    load(id: string | number, filter?: ModelServiceQueryTypes['filter']): Promise<TValue>,
    persist(value?: TValue): Promise<TValue>,
    awaitValue(promise: Promise<TValue>): Promise<TValue>,

    flush(): void,

    getModel(): AwaitableAsyncValueRef<TypefulModel>,
}
type ModelCollectionController<TValue> = AsyncValueRef<TValue[]> & {
    pagination: Readonly<CollectionPagination>,

    load(page?: number, perPage?: number, filter?: ModelServiceQueryTypes['filter'], sort?: ModelServiceQueryTypes['sort']): Promise<void>,
    fluent(): CollectionLoad<TValue>,
    createNew(item: TValue): Promise<TValue>,

    flush(): void

    getModel(): AwaitableAsyncValueRef<TypefulModel>,
}

interface CollectionLoad<TValue> {
    filter(query: ModelServiceQueryTypes['filter'] | undefined): this,

    load: ModelCollectionController<TValue>['load'],
}

export type ModelControllerOptions<TEntity> = {
    normalizeItem?: (item: TEntity) => Promise<TEntity> | TEntity,
    stringifyTo?: string,
}

function getAsyncModelFn(modelService: ReturnType<typeof useModelService>, modelName: string): () => AwaitableAsyncValueRef<TypefulModel> {
    const status = useAsyncIndicator('uninitialized')
    let modelAsync: AwaitableAsyncValueRef<TypefulModel>|null = null

    return () => {
        if (!modelAsync) {
            modelAsync = reactive({
                status: toRef(status, 'status'),
                value: null,
                ready: () => modelService.getModelAsync(modelName),
            })
            status.awaitTask(modelAsync.ready)
                .then((model) => modelAsync!.value = model)
        }

        return modelAsync
    }
}

export function useModelInstanceController<TEntity extends {} = any>(api: JsonApiAdapter, modelName: string, options?: ModelControllerOptions<TEntity>): ModelInstanceController<TEntity> {
    const status = useAsyncIndicator('uninitialized')
    const modelService = useModelService<TEntity>(api)

    // use typed variable because of struggles with TS Error around UnwrapRef:
    // Type 'unknown' is not assignable to type 'TEntity'.
    //   'TEntity' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.
    const ctrl: ModelInstanceController<TEntity> = {
        value: null,
        status: 'uninitialized',

        create(defaults) {
            return status.awaitTask(async () => {
                this.value = await modelService.createModelItem(modelName, defaults)
            })
        },
        load(id, filter) {
            return status.awaitTask(async () => {
                let item = await modelService.loadModelItem(modelName, id)
                if (options?.normalizeItem) {
                    item = await options.normalizeItem(item)
                }
                if (options?.stringifyTo) {
                    const model = await ctrl.getModel().ready()
                    set(item, options.stringifyTo, stringifyModelItem(model, item))
                }

                return this.value = item
            })
        },
        persist(value) {
            if (!value) {
                value = this.value || undefined
            }
            if (!value) {
                return Promise.reject(new Error('entity-not-initialized'))
            }

            return modelService.updateItem(modelName, value)
                .then((result) => this.value = result)
        },
        awaitValue(promise: Promise<TEntity>): Promise<TEntity> {
            return status.awaitTask(promise)
                .then((result) => this.value = result)
        },

        flush() {
            this.value = null
            status.status = 'uninitialized'
        },

        getModel: getAsyncModelFn(modelService, modelName),
    }

    return reactive({
        ...ctrl,
        status: toRef(status, 'status'),
    }) as ModelInstanceController<TEntity>
}

export function useModelCollectionController<TEntity extends {} = any>(api: JsonApiAdapter, modelName: string, options?: ModelControllerOptions<TEntity>): ModelCollectionController<TEntity> {
    const status = useAsyncIndicator()
    const modelService = useModelService<TEntity>(api)

    const pagination = ref<CollectionPagination>({page: 0, perPage: 0, totalItems: 0})

    const ctrl: ModelCollectionController<TEntity> = {
        status: 'uninitialized',
        pagination: pagination.value,
        value: [],

        async load(page?: number, perPage?: number, filter?: ModelServiceQueryTypes['filter'], sort?: ModelServiceQueryTypes['sort']): Promise<void> {
            await status.awaitTask(async () => {
                const result = await modelService.loadCollection(modelName, {
                    pagination: {page, perPage},
                    filter,
                    sort,
                })

                let items = result.items
                if (options?.normalizeItem) {
                    items = await Promise.all(items.map(options.normalizeItem))
                }
                if (options?.stringifyTo) {
                    const model = await ctrl.getModel().ready()
                    for (let item of items) {
                        set(item, options.stringifyTo!, stringifyModelItem(model, item))
                    }
                }

                this.value = items
            })
        },
        createNew(item) {
            return modelService.saveNewItem(modelName, item)
                .then((item) => {
                    this.value?.push(item)
                    return item
                })
        },
        fluent() {
            let filter: ModelServiceQueryTypes['filter'] | undefined
            return {
                filter(query) {
                    filter = query
                    return this
                },
                load: (page, perPage) => this.load(page, perPage, filter),
            }
        },
        flush() {
            this.value = []
            status.status = 'uninitialized'
            pagination.value.page = pagination.value.perPage = pagination.value.totalItems = 0
        },

        getModel: getAsyncModelFn(modelService, modelName),
    }

    return reactive({
        ...ctrl,
        status: toRef(status, 'status'),
        pagination: pagination,
    }) as ModelCollectionController<TEntity>

}

export function extendModelController<TCtrl extends object, TExtension extends object>(ctrl: TCtrl, ext: TExtension): TCtrl & TExtension {
    const result: Omit<TCtrl, keyof TExtension> & Partial<TExtension> = ctrl

    for (let prop in ext) {
        (result as any)[prop] = ext[prop]
    }

    return Object.assign(ctrl)
}
