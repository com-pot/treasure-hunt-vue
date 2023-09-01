import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import {AsyncValueRef} from "@src/modules/Typeful/types/asyncUtils"

import {computed, reactive, shallowRef, toRef} from "vue"
import {set} from "lodash"
import { ModelServiceQueryTypes } from "../model/TypefulModel"
import { ModelService, stringifyModelItem } from "../modelService"
import { PaginatedList } from "../model/list"


type ModelInstanceController<TValue> = AsyncValueRef<TValue> & {
    create(defaults?: Partial<TValue>): Promise<void>,
    load(id: string | number, filter?: ModelServiceQueryTypes['filter']): Promise<TValue>,
    persist(value?: TValue): Promise<TValue>,
    awaitValue(promise: Promise<TValue>): Promise<TValue>,

    flush(): void,
}
type ModelCollectionController<TValue> = AsyncValueRef<Readonly<PaginatedList<TValue>>> & {
    load(page?: number, perPage?: number, filter?: ModelServiceQueryTypes['filter'], sort?: ModelServiceQueryTypes['sort']): Promise<void>,
    createNew(item: TValue): Promise<TValue>,

    flush(): void
}

interface CollectionLoad<TValue> {
    filter(query: ModelServiceQueryTypes['filter'] | undefined): this,

    load: ModelCollectionController<TValue>['load'],
}

export type ModelControllerOptions<TEntity> = {
    normalizeItem?: (item: TEntity) => Promise<TEntity> | TEntity,
    stringifyTo?: string,
}

export function useModelInstanceController<TEntity extends {} = any>(modelService: ModelService, modelName: string, options?: ModelControllerOptions<TEntity>): ModelInstanceController<TEntity> {
    const status = useAsyncIndicator('uninitialized')

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
                let item = await modelService.loadModelItem<TEntity>(modelName, id)
                if (options?.normalizeItem) {
                    item = await options.normalizeItem(item)
                }
                if (options?.stringifyTo) {
                    const model = await modelService.getModelAsync(modelName)
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
    }

    return reactive({
        ...ctrl,
        status: toRef(status, 'status'),
    }) as ModelInstanceController<TEntity>
}

export function useModelCollectionController<TEntity extends {} = any>(modelService: ModelService, modelName: string, options?: ModelControllerOptions<TEntity>): ModelCollectionController<TEntity> {
    const status = useAsyncIndicator()

    const data = shallowRef<PaginatedList<TEntity>>({
        items: [],
        page: 0,
        perPage: 0,
        totalItems: 0,
        totalPages: 0,
    })

    const ctrl: Partial<ModelCollectionController<TEntity>>= {
        status: 'uninitialized',

        async load(page?: number, perPage?: number, filter?: ModelServiceQueryTypes['filter'], sort?: ModelServiceQueryTypes['sort']): Promise<void> {
            await status.awaitTask(async () => {
                const result = await modelService.loadCollection<TEntity>(modelName, {
                    pagination: {page, perPage},
                    filter,
                    sort,
                })

                let items = result.items
                if (options?.normalizeItem) {
                    items = await Promise.all(items.map(options.normalizeItem))
                }
                if (options?.stringifyTo) {
                    const model = await modelService.getModelAsync(modelName)
                    for (let item of items) {
                        set(item, options.stringifyTo!, stringifyModelItem(model, item))
                    }
                }

                return data.value = {
                    ...result,
                    items,
                }
            })
        },
        createNew(item) {
            return modelService.saveNewItem<TEntity>(modelName, item)
                .then((item) => {
                    data.value = {
                        ...data.value,
                        items: [...data.value.items as any[], item],
                        totalItems: data.value.totalItems + 1,
                    }
                    return item
                })
        },
        flush() {
            data.value = {
                items: [],
                page: 0,
                perPage: 0,
                totalItems: 0,
                totalPages: 0,
            }
            status.status = 'uninitialized'
        },
    }

    return reactive({
        ...ctrl,
        value: computed(() => data.value) as unknown as Readonly<PaginatedList<TEntity>>,
        status: toRef(status, 'status'),
    }) as ModelCollectionController<TEntity>

}

/**
 * Typing helper for extending model
 */
export function extendModelController<TCtrl extends object, TExtension extends object>(ctrl: TCtrl, ext: TExtension): TCtrl & TExtension {
    const result: Omit<TCtrl, keyof TExtension> & Partial<TExtension> = ctrl

    for (let prop in ext) {
        (result as any)[prop] = ext[prop]
    }

    return Object.assign(ctrl)
}
