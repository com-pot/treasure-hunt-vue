import {reactive} from "vue";


export default function useAsyncIndicator(initStatus: AsyncIndicator['status'] = 'ready') {
    return reactive<AsyncIndicator>({
        status: initStatus,

        awaitTask(task, loadingState = 'loading') {
            this.status = loadingState
            const promise = typeof task === 'function' ? task() : task
            return promise
                .then((result) => {
                    this.status = 'ready'
                    return result
                })
                .catch((error) => {
                    this.status = 'error'
                    throw error
                })
        },
    })
}

export type AsyncIndicator = {
    status: 'uninitialized' | 'loading' | 'saving' | 'ready' | 'error',

    awaitTask<T>(task: Promise<T>|(() => Promise<T>), asyncState?: AsyncIndicator['status']): Promise<T>
}
