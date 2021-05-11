<template>
  <div class="mg-password">
    <p>{{ data.prompt }}</p>
    <input v-model="state.value.password">
    <MinigameControls :reset="state.reset" :check-solution="checkSolution"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive} from "vue"
import {useViewData, useViewState} from "@/modules/SotW/utils/useViewState"
import {useMinigameControls} from "@/modules/SotW/utils/minigameUtils"
import MinigameControls from "@/modules/SotW/components/MinigameControls.vue"

type PasswordViewData = {
  prompt: string,
}
type PasswordViewState = {
  password: string,
}

export default defineComponent({
  components: {
    MinigameControls,
  },
  setup() {
    const data = useViewData<PasswordViewData>()
    const state = reactive(useViewState<PasswordViewState>(() => ({
      password: '',
    })))
    const controls = useMinigameControls()

    return {
      data,
      state,

      checkSolution() {
        controls.checkSolution(controls.serializeSolution(state.value.password))
      },
    }
  },
})
</script>
