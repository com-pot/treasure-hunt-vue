<template>
  <div :class="['navigation', isOpen && 'open']">
    <slot></slot>
  </div>
  <div class="pull-strap" @click="isOpen = !isOpen">
    <span class="hamburger">
      <i></i><i></i><i></i>
    </span>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";

export default defineComponent({
  setup() {
    const isOpen = ref(false);

    return {
      isOpen,
    }
  },
});
</script>

<style lang="scss">
$navigationWidth: 80vw;
$navOpenTransition: 0.2s ease;

.navigation {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  height: 100vh;
  width: $navigationWidth;

  background: lightblue;
  border-right: 2px solid darken(lightblue, 20%);

  display: flex;
  flex-direction: column;

  padding: 8px;

  transition: left $navOpenTransition;

  + .pull-strap {
    position: fixed;
    z-index: 101;
    top: 2rem;
    left: calc(#{$navigationWidth} - 2px);

    background: lightblue;
    border: 2px solid darken(lightblue, 20%);
    border-left: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    padding: 4px;

    transition: left $navOpenTransition;
  }

  &:not(.open) {
    left: -$navigationWidth;

    + .pull-strap {
      left: -2px;
    }
  }
}
</style>
