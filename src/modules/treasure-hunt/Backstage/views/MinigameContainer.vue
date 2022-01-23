<template>
  <PlayerViewLoading v-if="status === 'loading'"/>
  <div class="mg-container" v-else-if="status === 'ready'">
    <component :is="mgComponent"/>
    <div class="node-navigation -actions">
      <div class="spacer"/>

      <div class="nav-actions">
        <button v-if="mgControls.reset" @click="mgControls.reset"
                class="btn btn-bland"
                :disabled="mgControls.status === 'evaluating'"
        >Začít znovu</button>

        <router-link class="btn" :to="{name: 'minigame.dev.index'}">Pryč</router-link>

        <button v-if="mgControls.getValue" @click="mgControls.checkSolution()"
                :class="['btn', mgControls.status === 'success' ? 'btn-success' :'btn-vivid']"
                :disabled="mgControls.status === 'evaluating'"
        >Vyzkoušet řešení</button>
      </div>

      <div class="spacer"/>
    </div>

    <CodeExample header="Konfigurace">
      <template #default>{{ {config: mgDemoData.challengeConfig, checkHash} }}</template>
    </CodeExample>

  </div>
  <div class="view-error" :data-status="status" v-else>
    Jejda, nepovedlo se inicializovat pohled.
    <pre>
      status: [{{ status }}]
    </pre>
  </div>
</template>

<script lang="ts">
import {defineComponent, provide, ref, shallowRef, watch} from "vue"
import {hasComponentStatus} from "@/modules/Layout/utils/componentHelpers"
import CodeExample from "@/modules/Layout/components/CodeExample.vue"
import PlayerViewLoading from "../../views/PlayerViewLoading.vue"
import {loadMinigameComponent, loadMinigameComponentDemoData} from "../../utils/minigameUtils"
import {createMinigameControls} from "../../components/minigameData"

export default defineComponent({
  components: {
    CodeExample,
    PlayerViewLoading,
  },
  props: {
    minigame: {type: String, required: true},
  },
  setup(props) {
    const status = hasComponentStatus()

    const mgComponent = shallowRef(null)
    const mgDemoData = ref<any>(null)
    const mgStateData = ref(null)
    const checkHash = ref('')

    provide('sotw.viewData', mgDemoData)
    provide('sotw.viewStateData', mgStateData)
    const mgControls = createMinigameControls({
      provide: true,
      checkAnswer: (value) => {
        checkHash.value = value
        return Promise.resolve({status: 'ok'})
      },
    })

    watch(() => props.minigame, (minigame) => {
      mgDemoData.value = mgComponent.value = null
      status.value = 'loading'

      const minigameLoad = loadMinigameComponent(minigame)
          .then((componentModule) => mgComponent.value = componentModule.default)
      const demoDataLoad = loadMinigameComponentDemoData(minigame)
          .then((data) => mgDemoData.value = {challengeConfig: data})

      Promise.all([minigameLoad, demoDataLoad])
          .then(() => status.value = 'ready')
          .catch((err) => {
            status.value = 'error'
            throw err
          })

    }, {immediate: true})

    return {
      status,
      mgDemoData,
      mgComponent,
      mgControls,

      checkHash,
    }
  },
})
</script>
