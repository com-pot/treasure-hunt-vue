<template>
  <BackstageNavigation/>
  <router-view/>
</template>
<script>
import BackstageNavigation from "./components/BackstageNavigation";
export default {
  components: {BackstageNavigation}
}
</script>
