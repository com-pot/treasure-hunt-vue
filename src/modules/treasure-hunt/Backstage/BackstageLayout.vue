<template>
  <BackstageNavigation/>
  <router-view/>
</template>

<script lang="ts">
import BackstageNavigation from "./components/BackstageNavigation.vue";
export default {
  components: {BackstageNavigation}
}
</script>
