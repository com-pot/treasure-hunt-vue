import Swal, {SweetAlertOptions} from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"
import {produceMutable} from "@src/utils/immutable"

export const useAlert = () => Swal

const toastController = {
    success(text: string, opts: SweetAlertOptions) {
        return Swal.fire(produceMutable(opts, (opts) => {
            opts.text = text
            opts.icon = 'success'
            opts.toast = true
        }))
    },

    error(text: string, opts: SweetAlertOptions) {
        return Swal.fire(produceMutable(opts, (opts) => {
            opts.text = text
            opts.icon = 'error'
            opts.toast = true
        }))
    }
}
export const useToast = () => toastController
