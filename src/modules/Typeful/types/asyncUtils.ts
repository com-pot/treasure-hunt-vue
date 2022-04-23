import {AsyncIndicator} from "@src/modules/Layout/mixins/useAsyncIndicator"

export type AsyncValueRef<TValue> = {
    status: Readonly<AsyncIndicator['status']>,
    value: TValue | null,
}

export type AwaitableAsyncValueRef<TValue> = AsyncValueRef<TValue> & {
    ready(): Promise<TValue>,
}
