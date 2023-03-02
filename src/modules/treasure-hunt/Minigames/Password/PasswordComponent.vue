<template>
  <div class="mg-password">
    <p class="prompt">{{ challengeConfig.prompt }}</p>
    <form @submit.prevent="$emit('check-solution')">
      <input v-model="state.value.password" name="password" :disabled="status === 'loading'">
      <button style="display: none"/>
    </form>

  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, reactive} from "vue"
import {exposeMinigameControls, useViewState} from "@src/modules/treasure-hunt/components/minigameData"
import {hasComponentStatus} from "@src/modules/Layout/utils/componentHelpers"
import {resolveAfter} from "@src/utils/promiseUtils"

type PasswordViewData = {
  prompt: string,
  caseSensitive?: boolean,
}
type PasswordViewState = {
  password: string,
}

export default defineComponent({
  props: {
    challengeConfig: {type: Object as PropType<PasswordViewData>, required: true},
  },
  setup(props, {emit}) {
    const state = reactive(useViewState<PasswordViewState>(() => ({
      password: '',
    })))
    const status = hasComponentStatus('ready')

    exposeMinigameControls({
      reset: () => untype(),
      getValue: () => props.challengeConfig.caseSensitive ? state.value.password : state.value.password.toLowerCase( ),
    }, emit)

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
      state,
      status,
    }
  },
})
</script>
