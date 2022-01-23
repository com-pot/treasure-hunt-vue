<template>
  <div class="mg-password">
    <p class="prompt">{{ data.prompt }}</p>
    <input v-model="state.value.password" name="password" :disabled="status === 'loading'">
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive} from "vue"
import {useMinigameData, useViewState} from "@/modules/treasure-hunt/components/minigameData"
import {useMinigameControls} from "@/modules/treasure-hunt/components/minigameData"
import {hasComponentStatus} from "@/modules/Layout/utils/componentHelpers"
import {resolveAfter} from "@/utils/promiseUtils"

type PasswordViewData = {
  prompt: string,
  caseSensitive?: boolean,
}
type PasswordViewState = {
  password: string,
}

export default defineComponent({

  setup() {
    const data = useMinigameData<PasswordViewData>()
    const state = reactive(useViewState<PasswordViewState>(() => ({
      password: '',
    })))
    const status = hasComponentStatus('ready')

    useMinigameControls({
      reset: () => untype(),
      getValue: () => data.value.caseSensitive ? state.value.password : state.value.password.toLowerCase( ),
    })

    const untype = async () => {
      status.value = 'loading'

      let val = state.value.password
      while (val.length) {
        val = val.substr(0, val.length - 1)
        state.value.password = val
        await resolveAfter(Math.round(25 + Math.random() * 50))
      }

      status.value = 'ready'
    }

    return {
      data,
      state,
      status,
    }
  },
})
</script>
