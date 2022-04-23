<template>
  <div class="backstage-nav">
    <template v-for="item in items">
      <hr v-if="item.type === 'separator'">

      <router-link v-else :to="item.to"
                   class="btn"
                   :active-class="getActiveClass(item)"
                   :exact-active-class="getActiveClass(item, 'exact')">{{ item.caption }}</router-link>
    </template>
  </div>
</template>

<script lang="ts">

import {PropType} from "vue"
import {NavigationItem, navItemIsLink} from "@src/modules/treasure-hunt/Backstage/navigation/NavigationModel"

export default {
  props: {
    items: {type: Array as PropType<any[]>, required: true},
  },

  setup() {
    return {
      getActiveClass(item: NavigationItem, mode?: 'exact'): string|undefined {
        const exactMatch = mode === 'exact'

        if (navItemIsLink(item) && (!!item.exact) === exactMatch) {
          return '-acc-primary'
        }
      },
    }
  },
}
</script>
