import {defineComponent, h, onMounted, ref} from "vue"
import SotwLayout from "@/../custom/sotw/SotwLayout.vue"

export default defineComponent({
    props: {
        rootSelector: {type: String, required: true},
    },
    setup(props) {
        const appRootEl = ref<HTMLDivElement>(document.querySelector(props.rootSelector) as HTMLDivElement)
        onMounted(function() {
            appRootEl.value.classList.add('theme-sotw')
        })
        return function(this: any) {
            console.log('render app', this)
            return h(SotwLayout)
        }
    },
})

