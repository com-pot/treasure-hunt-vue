<template>

  <div class="root-container">
    <router-view />
  </div>

  <div class="bg">
    <div class="cloud cloud-top-left"></div>
    <div class="cloud cloud-top-right"></div>
  </div>

</template>

<style lang="scss">

#sotw {
  .root-container {
    z-index: 1;

    max-width: 420px;
    width: 100vw;

    padding-block-start: 60px;
    margin: 0 auto;
  }
}
</style>
