import {defineComponent, h} from "vue";
import {RouterView} from "vue-router";

export default  defineComponent({
    setup(props, {attrs}) {
        return () => h(RouterView, {
            ...attrs,
        });
    },
});

