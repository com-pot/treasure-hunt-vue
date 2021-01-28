<template>
  <div :class="['mg-bpc', solved && 'solved']">

    <p class="problem-description">
      2 beaks, 1 Spider. How much?
    </p>

    <form class="input" @submit.prevent="checkValues">
      <div class="input-pair" v-for="input in inputs" :key="input.name">
        <label :for="input.name">{{ input.caption }}</label>
        <input type="numeric" inputmode="number" :disabled="solved" v-model.number="inputsModel[input.name]"
               :id="input.name"/>
      </div>

      <div class="input-pair input-pair-full input-pair-center">
        <label>&nbsp;</label>
        <button type="submit" class="btn btn-vivid" :disabled="solved">Check</button>
      </div>
    </form>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";

type InputSpec = {
  name: string,
  caption: string,
  expectedCount: number,
};

export default defineComponent({
  setup() {
    let inputs = ref([
      {name: "leg", caption: "Legs", expectedCount: 16},
      {name: "gryphon", caption: "Gryphons", expectedCount: 2},
      {name: "eye", caption: "Eyes", expectedCount: 12},
    ] as InputSpec[]);
    let solved = ref(false);

    let inputsModel = ref({
      gryphon: 1,
    } as {[name: string]: number});

    function checkValues() {
      let allCorrect = inputs.value.every((input) => inputsModel.value[input.name] === input.expectedCount);
      if (allCorrect) {
        solved.value = true;
      }
    }

    return {
      inputs,
      inputsModel,
      checkValues,
      solved,
    };
  },
});

</script>

<style lang="scss">
.mg-bpc {
  .input {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.25em;

    .input-pair {
      flex: 0 1 120px;
      //min-width: 120px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &.input-pair-full {
        flex: 1 0 100%;
      }

      &.input-pair-center {
        align-items: center;
      }

      input {
        align-self: stretch;
      }
    }
  }

  &.solved {
    input[disabled] {
      background: lightgreen;
    }
  }
}
</style>

