import {computed, PropType, reactive} from "vue"
import {isNil} from "lodash"

export default {
    props: {
        modelValue: {},
        multiple: {type: Boolean},

        options: {type: Array as PropType<any[]>},
    },

    createSelectionController<TValue extends string|number = string, TOption extends {value: TValue} = any>(props: any, setValue: any) {
        const iv = computed<TValue|TValue[]>({
            get() {
                let value = props.modelValue
                if (props.multiple) {
                    if (!Array.isArray(value)) {
                        value = isNil(value) ? [] : [value]
                    }
                }
                return value
            },
            set(value) {
                setValue(value)
            },
        })

        return reactive({
            value: iv,

            isActive: (option: TOption) => Array.isArray(iv.value)
                ? iv.value.includes(option.value)
                : iv.value === option.value,
            toggleActive(option: TOption, desiredState?: boolean) {
                const actualState = this.isActive(option)
                if (isNil(desiredState)) {
                    desiredState = !actualState
                }
                if (actualState === desiredState) {
                    return
                }

                if (Array.isArray(iv.value)) {
                    if (desiredState) {
                        setValue([...iv.value, option.value])
                    } else {
                        setValue(iv.value.filter((item) => item !== option.value))
                    }
                } else {
                    iv.value = option.value
                }
            }
        })
    },
}
