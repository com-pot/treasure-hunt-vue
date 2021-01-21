<template>
  <router-link :to="{name: 'minigames.understand'}">Understand</router-link>
  <router-link :to="{name: 'minigames.domino'}">Domino</router-link>
  <router-link :to="{name: 'minigames.toggleMatrix'}">Toggle matrix</router-link>
  <router-link :to="{name: 'minigames.sittingShamans'}">Sitting shamans</router-link>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({

});
</script>
