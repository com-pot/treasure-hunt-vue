import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import {reactive, Ref, toRef, watch} from "vue"

import QrScanner from 'qr-scanner'

type UseQrScannerOptions = {
    onDecode: (result: QrScanner.ScanResult) => void,
    onError?: (error: any) => void,
}

export default function useQrScanner(container: Ref<HTMLElement>, opts: UseQrScannerOptions) {
    const status = useAsyncIndicator('uninitialized')

    let videoEl: HTMLVideoElement
    let qrCtrl: QrScanner

    const qrScanner = reactive({
        status: toRef(status, 'status'),

        destroy() {
            this.qrCtrl?.destroy()
            this.qrCtrl = null

            videoEl?.remove()
            videoEl = null
        },

        start() {
            if (status.status !== 'uninitialized' || !qrCtrl) {
                return
            }
            return status.awaitTask(qrCtrl.start())
                .catch((err) => {
                    opts?.onError(err)
                    throw err
                })
        },
        stop() {
            if (status.status !== 'ready' || !qrCtrl) {
                return
            }
            qrCtrl.stop()
            status.status = 'uninitialized'
        },
    })

    watch(container, (container) => {
        qrScanner.destroy()
        if (!container) {
            return
        }
        videoEl = document.createElement('video')
        container.append(videoEl)

        qrCtrl = new QrScanner(videoEl, opts.onDecode, {})
    }, {immediate: true})

    return qrScanner
}
