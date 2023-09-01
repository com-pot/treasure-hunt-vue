<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<script lang="ts" setup>
import {ref} from "vue"
import TypefulInputPair from "@src/modules/Typeful/components/TypefulInputPair"
import TypefulAutoSection from "@src/modules/Typeful/components/TypefulAutoSection"
import MinigameComponent from "@src/modules/treasure-hunt/components/MinigameComponent.vue"
import {ChallengeType} from "@src/modules/treasure-hunt/model/ChallengeType"
import {useTypeRegistry} from "@src/modules/Typeful/typeRegistry"
import {createMinigameController} from "@src/modules/treasure-hunt/components/minigameData"
import TypefulInput from "@src/modules/Typeful/components/TypefulInput"
import StoryAction from "@src/modules/treasure-hunt/Backstage/components/StoryAction.vue"
import TypefulList from "@src/modules/Typeful/components/TypefulList.vue"
import contentBlockBase from "./contentBlockBase"

const props = defineProps({
  ...contentBlockBase.props,
})

const typeRegistry = useTypeRegistry()

const selectedChallengeType = ref<ChallengeType|null>(null)
const paramsSchema = ref(null)

const answerChecksum = ref<string>('')

const mgController = createMinigameController({
  checkAnswer(block, value) {
    console.log('checkAnswer', value)
    answerChecksum.value = value
    return Promise.resolve({
      status: 'ok',
    })
  }
})

function setSelectedChallengeType(value: ChallengeType|null) {
  if (value && value.type === selectedChallengeType.value?.type) {
    return
  }

  const prevValue = selectedChallengeType.value
  selectedChallengeType.value = value

  if (!value) {
    props.block.challengeConfig = {}
    paramsSchema.value = null
  } else {
    paramsSchema.value = {type: 'object', properties: value.params}
    if (!props.block.challengeConfig || prevValue) {
      props.block.challengeConfig = typeRegistry.getDefaultValue(paramsSchema.value)
      if (value.type === 'choice.value-label') {
        props.block.challengeConfig.appearance = {
          key: 'button',
        }
      }
    }
  }
}

function addOnError(block) {
  if (!block.onError) {
    block.onError = []
  }
  block.onError.push({})
}

function replaceOnError(block, index, action) {
  console.log('replace onError item', block, index)
  const onError = block.onError.slice()
  onError[index] = action
  block.onError = onError
}

</script>

<template>
  <MinigameComponent v-if="viewMode === 'live'"
                     :challenge-type="block.challengeType" :challenge-config="block.challengeConfig"
                     v-bind="$attrs"
  />

  <template v-else>
    <div class="challenge-block" :data-mode="viewMode">
      <template v-if="viewMode === 'edit'">
        <fieldset class="form-auto-layout">
          <TypefulInputPair name="challengeType" label="Typ výzvy" type="relation" target="treasure-hunt.challenge-type"
                            v-model="block.challengeType"
                            @update:selected-item="setSelectedChallengeType($event)"
          />
          <TypefulInputPair name="customController" label="Vlastní logika" type="string" v-model="block.customController"/>
        </fieldset>

        <template v-if="selectedChallengeType">
          <hr/>
          <p v-if="!selectedChallengeType.params">Výzva není parametrizovatelná</p>
          <TypefulAutoSection v-else tag="fieldset" class="form-auto-layout"
                              :inputs="selectedChallengeType.params"
                              v-model="block.challengeConfig"
          />
        </template>
      </template>
      <template v-if="viewMode === 'preview'">
        <MinigameComponent
            :challenge-type="block.challengeType"
            :challenge-config="block.challengeConfig"

            v-bind="$attrs"
            @expose-minigame-controls="(controls) => mgController.acceptMinigame(controls)"
            @check-solution="(value) => mgController.checkSolution(undefined, value)"
        />
        <hr>
        <div class="preview-controls">
          <button class="btn -sm" :disabled="!mgController.getValue" @click.prevent="mgController.checkSolution()">Zjistit hodnotu</button>
          <TypefulInput type="text" readonly :model-value="answerChecksum"/>
          <button class="btn -sm" :disabled="!answerChecksum" @click.prevent="block.checkSum = answerChecksum">Označit za správnou</button>
        </div>
      </template>
    </div>

    <hr/>

    <div class="challenge-actions">
      <TypefulInputPair name="checkSum" v-model="block.checkSum" label="Správná odpověď"/>
      <hr>
      <div class="tile tile-body" data-bg="brighten">
        <TypefulList v-model="block.onError" label="Při nesprávné odpovědi"
                     :add-item="() => addOnError(block)">
          <template #item="{item, index}">
            <StoryAction :model-value="item" @update:model-value="replaceOnError(block, index, $event)"></StoryAction>
          </template>
        </TypefulList>
      </div>
    </div>
  </template>
</template>

<style lang="scss">
.challenge-block {
  .preview-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    input {
      flex: 1;
    }
  }
}
</style>
