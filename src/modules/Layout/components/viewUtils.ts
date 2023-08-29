import Swal, {SweetAlertOptions} from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import {produceMutable} from "@src/utils/immutable"
import { inject } from "vue"
import { DialogController } from "./dialogController"

const configuredSwal = Swal.mixin({
    position: "top-right",
})

export const useAlert = () => configuredSwal

const toastController = {
    core: configuredSwal,
    success(text: string, opts: SweetAlertOptions = {}) {
        return configuredSwal.fire(produceMutable(opts, (opts) => {
            opts.text = text
            opts.icon = 'success'
            opts.toast = true
        }))
    },

    error(text: string, opts: SweetAlertOptions = {}) {
        return configuredSwal.fire(produceMutable(opts, (opts) => {
            opts.text = text
            opts.icon = 'error'
            opts.toast = true
        }))
    }
}
export const useToast = () => toastController

export const useDialogController = () => inject("layout:dialogController") as DialogController
