<template>
  <LoadingIndicator size="fill" v-if="asyncIndicator.status === 'loading'"/>

  <div class="mg-sandbox" v-else-if="asyncIndicator.status === 'ready'">
    <h1>Minigame sandbox</h1>
    <MinigameComponent :challenge-type="minigame"
                       :challenge-config="configuration.data"

                       @check-solution="(solution) => mgController.checkSolution(null, solution)"
                       @expose-minigame-controls="mgController.acceptMinigame"
    />

    <div class="node-navigation -actions">
      <div class="spacer"/>

      <div class="nav-actions">
        <button v-if="mgController.reset" @click="mgController.reset"
                class="btn -acc-secondary"
                :disabled="mgController.status === 'evaluating'"
        >Začít znovu</button>

        <router-link class="btn" :to="{name: 'minigame.dev.index'}">Pryč</router-link>

        <button v-if="mgController.getValue" @click="mgController.checkSolution()"
                :class="['btn', mgController.status === 'success' ? '-acc-success' :'-acc-primary']"
                :disabled="mgController.status === 'evaluating'"
        >Vyzkoušet řešení</button>
      </div>

      <div class="spacer"/>
    </div>

    <div class="section-heading">
      <h2>Zkouška řešení</h2>
      <hr/>
    </div>
    <code>{{ {checkHash} }}</code>

    <div class="section-heading">
      <h2>Konfigurace minihry</h2>
      <hr>
      <button class="btn" v-if="configuration.getConfig" @click="configuration.apply">Aplikovat</button>
    </div>
    <MinigameConfigurator :challenge-type="minigame" :challenge-config="configuration.data"
                          @expose-configuration-fn="(getConfig) => configuration.getConfig = getConfig"/>
  </div>

  <div class="view-error" :data-status="asyncIndicator.status" v-else>
    Jejda, nepovedlo se inicializovat pohled.
    <pre>
      status: [{{ asyncIndicator.status }}]
    </pre>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref, watch} from "vue"
import useAsyncIndicator from "@src/modules/Layout/mixins/useAsyncIndicator"
import CodeExample from "@src/modules/Layout/components/CodeExample.vue"
import LoadingIndicator from "@src/modules/Layout/components/LoadingIndicator.vue"
import {loadMinigameComponentDemoData} from "../../utils/minigameUtils"
import {createMinigameController} from "../../components/minigameData"
import MinigameComponent from "@src/modules/treasure-hunt/components/MinigameComponent.vue"
import MinigameConfigurator from "@src/modules/treasure-hunt/components/MinigameConfigurator"

export default defineComponent({
  components: {
    MinigameComponent,
    MinigameConfigurator,
    LoadingIndicator,
    CodeExample,
  },
  props: {
    minigame: {type: String, required: true},
  },
  setup(props) {
    const asyncIndicator = useAsyncIndicator()

    const configuration = reactive({
      data: null as any,
      getConfig: null as (() => any),

      apply() {
        const config = configuration.getConfig?.()
        if (config) {
          configuration.data = config
        }
      },
    })
    const elConfigurator = ref<any>(null)

    const checkHash = ref('')

    const mgController = createMinigameController({
      checkAnswer: (block, value) => {
        checkHash.value = value
        return Promise.resolve({status: 'ok'})
      },
    })

    function loadDemoData(minigame: string) {
      configuration.data = null
      configuration.getConfig = null

      const demoDataLoad = loadMinigameComponentDemoData(minigame)
          .then((data) => configuration.data = data)

      asyncIndicator.awaitTask(Promise.all([demoDataLoad]))
    }

    watch(() => props.minigame, loadDemoData, {immediate: true})

    return {
      asyncIndicator,

      configuration,


      mgController,

      checkHash,
    }
  },
})
</script>
