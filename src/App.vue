<template>
<!--  <img alt="Vue logo" src="./assets/logo.png">-->
<!--  <CircularDomino />-->
  <UnderstandComponent />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UnderstandComponent from "./minigames/Understand/UnderstandComponent.vue";
// import CircularDomino from "./minigames/CircularDomino/CircularDominoComponent.vue";

export default defineComponent({
  name: 'App',
  components: {
    UnderstandComponent,
    // CircularDomino
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
